import config from './config/config';
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coffee } from 'lucide-react';
import { GitHubIcon } from './components/icons';
import DownloadProgress from './components/DownloadProgress';
import UsageStats from './components/UsageStats';

const App = () => {
  const [groupedLinks, setGroupedLinks] = useState({});
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState({ years: [], months: [] });
  const [workerCount, setWorkerCount] = useState(3);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const processFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html')) {
      setError('Invalid file type. Only HTML files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the limit of 10MB.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setGroupedLinks({});

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      const links = Array.from(doc.querySelectorAll('a[href*="javascript:downloadMemories"]'));
      const grouped = {};
      
      links.forEach(link => {
        const dateElement = link.closest('tr').querySelector('td:first-child');
        if (dateElement) {
          const dateText = dateElement.textContent.trim();
          const match = dateText.match(/(\d{4})-(\d{2})-\d{2}/);
          
          if (match) {
            const [_, year, month] = match;
            if (!grouped[year]) grouped[year] = {};
            if (!grouped[year][month]) grouped[year][month] = [];
            
            const href = link.getAttribute('href');
            const downloadUrl = href.match(/downloadMemories\('(.+?)'\)/)[1];
            
            grouped[year][month].push({
              url: downloadUrl,
              text: link.textContent,
              date: dateText
            });
          }
        }
      });

      setGroupedLinks(grouped);
    } catch (err) {
      setError('Error processing file: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFiles = async () => {
    if (selectedItems.years.length === 0 && selectedItems.months.length === 0) {
      setError('Please select at least one year or month to download');
      return;
    }
  
    // Collect all selected URLs
    const urls = [];
    selectedItems.months.forEach(yearMonth => {
      const [year, month] = yearMonth.split('-');
      if (groupedLinks[year]?.[month]) {
        urls.push(...groupedLinks[year][month].map(link => link.url));
      }
    });
  
    selectedItems.years.forEach(year => {
      if (groupedLinks[year]) {
        Object.values(groupedLinks[year]).forEach(monthLinks => {
          urls.push(...monthLinks.map(link => link.url));
        });
      }
    });
  
    setDownloadStatus({
      total: urls.length,
      completed: 0,
      failed: 0,
      inProgress: true,
      startTime: Date.now(),
      errors: {}
    });
  
    const downloadWorker = new DownloadWorker(workerCount);
    
    downloadWorker.onProgress = (completed, failed, errors) => {
      setDownloadStatus(prev => ({
        ...prev,
        completed,
        failed,
        errors
      }));
    };
  
    downloadWorker.onComplete = (errors) => {
      setDownloadStatus(prev => ({
        ...prev,
        inProgress: false,
        errors
      }));
    };
  
    await downloadWorker.addToQueue(urls);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Snapchat Memories Downloader</h1>
            <div className="flex gap-4">
              <a href={config.github.url} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <GitHubIcon size={20} />
                <span className="text-sm">GitHub</span>
              </a>
              <a href={config.coffee.url}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Coffee size={20} />
                <span className="text-sm">Buy me a coffee</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Privacy Notice */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">🔒 Privacy First: Your Data Stays Private</h2>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Your HTML file is processed entirely in your browser - no data is uploaded to any server</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>All media downloads happen directly in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>No tracking, no cookies, no analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Upload Memories HTML File</h2>
            </CardHeader>
            <CardContent>
              {/* Collapsible Instructions */}
              <div className="mb-4">
                <button
                  onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                  className="flex items-center justify-between w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">
                    How to get your Snapchat Memories HTML file
                  </span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${isInstructionsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isInstructionsOpen && (
                  <div className="mt-3 pl-3 border-l-2 border-gray-200">
                    <div className="mb-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                      <div className="font-medium">⚠️ Requirements:</div>
                      <div className="mt-1">
                        <div>• Only memories_history.html files generated from Snapchat are supported</div>
                        <div>• Max 10MB file size</div>
                      </div>
                    </div>
                    
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li>1. Login into your Snapchat account website</li>
                      <li>2. Generate the memories export under 'My Data' and select timerange and everything needed</li>
                      <li>3. You will receive the memories_history.html from your accounts website when ready</li>
                      <li>4. Upload the memories_history.html file below</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* File Input */}
              <input
                type="file"
                accept=".html"
                onChange={processFile}
                className="w-full p-2 border rounded"
              />
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Download Options */}
          {Object.keys(groupedLinks).length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Download Options</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Worker Count Slider */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Parallel Downloads: {workerCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={workerCount}
                      onChange={(e) => setWorkerCount(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Higher values = faster downloads but may cause errors
                    </p>
                  </div>

                  {/* Selection Interface */}
                  <div className="space-y-4">
                    {Object.entries(groupedLinks).map(([year, months]) => (
                      <div key={year}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.years.includes(year)}
                            onChange={(e) => {
                              setSelectedItems(prev => ({
                                ...prev,
                                years: e.target.checked 
                                  ? [...prev.years, year]
                                  : prev.years.filter(y => y !== year)
                              }));
                            }}
                            className="rounded"
                          />
                          <span className="font-medium">{year}</span>
                        </label>
                        <div className="ml-6 mt-2 grid grid-cols-2 gap-2">
                          {Object.entries(months)
                            .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
                            .map(([month, links]) => (
                            <label key={month} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedItems.months.includes(`${year}-${month}`)}
                                onChange={(e) => {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    months: e.target.checked
                                      ? [...prev.months, `${year}-${month}`]
                                      : prev.months.filter(m => m !== `${year}-${month}`)
                                  }));
                                }}
                                className="rounded"
                              />
                              <span>
                                {new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })}
                                <span className="text-gray-500 ml-1">({links.length})</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={downloadFiles}
                    disabled={downloadStatus?.inProgress}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {downloadStatus?.inProgress ? 'Downloading...' : 'Start Download'}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Usage Stats here */}
          {downloadStatus && (
            <div className="mt-6">
              <UsageStats 
                groupedLinks={groupedLinks}
                downloadStartTime={downloadStatus.startTime}
              />
            </div>
          )}  

          {/* Download Progress */}
          {downloadStatus && <DownloadProgress status={downloadStatus} />}  

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
          This website is not affiliated with, endorsed by, or sponsored by Snapchat. Snapchat is a registered trademark of Snap Inc. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Download Worker Class
class DownloadWorker {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.activeDownloads = 0;
    this.maxConcurrent = maxConcurrent;
    this.completed = 0;
    this.failed = 0;
    this.errors = {};
    this.startTime = null;
    this.onProgress = () => {};
    this.onComplete = () => {};
  }

  async addToQueue(urls) {
    this.startTime = Date.now();
    this.queue.push(...urls);
    this.processQueue();
  }

  async processQueue() {
    while (this.queue.length > 0 && this.activeDownloads < this.maxConcurrent) {
      this.activeDownloads++;
      const url = this.queue.shift();
      
      try {
        await this.downloadFile(url);
        this.completed++;
      } catch (error) {
        console.error(`Download failed: ${error.message}`);
        this.failed++;
        this.errors[error.message] = (this.errors[error.message] || 0) + 1;
      } finally {
        this.activeDownloads--;
        this.onProgress(this.completed, this.failed, this.errors);
        
        if (this.queue.length > 0) {
          this.processQueue();
        } else if (this.activeDownloads === 0) {
          this.onComplete(this.errors);
        }
      }
    }
  }

  downloadFile(url) {
    return new Promise((resolve, reject) => {
      const parts = url.split("?");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", parts[0], true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const mediaUrl = xhr.responseText.trim();
              if (!mediaUrl) {
                reject(new Error('Empty media URL received'));
                return;
              }

              // Create a unique ID for this download
              const downloadId = `download-frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const iframe = document.createElement('iframe');
              iframe.id = downloadId;
              iframe.style.display = 'none';
              document.body.appendChild(iframe);
              
              iframe.contentWindow.document.write(`
                <a download href="${mediaUrl}">Download</a>
                <script>
                  document.querySelector('a').click();
                  window.parent.postMessage({
                    type: 'download-started',
                    downloadId: '${downloadId}'
                  }, '*');
                </script>
              `);
              
              let isCleanedUp = false;
              const cleanup = () => {
                if (isCleanedUp) return;
                isCleanedUp = true;
                
                const frame = document.getElementById(downloadId);
                if (frame && frame.parentNode) {
                  frame.parentNode.removeChild(frame);
                }
                resolve();
              };
              
              const messageHandler = (event) => {
                if (event.data?.type === 'download-started' && 
                    event.data?.downloadId === downloadId) {
                  window.removeEventListener('message', messageHandler);
                  setTimeout(cleanup, 1000);
                }
              };
              
              window.addEventListener('message', messageHandler);
              
              // Fallback cleanup
              setTimeout(() => {
                window.removeEventListener('message', messageHandler);
                cleanup();
              }, 5000); // Increased timeout for larger files
              
            } catch (e) {
              reject(new Error('Failed to process download'));
            }
          } else if (xhr.status === 403) {
            reject(new Error('Link expired'));
          } else {
            reject(new Error(`Failed with status ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Request timed out'));
      xhr.timeout = 30000; // 30 second timeout
      
      try {
        xhr.send(parts[1]);
      } catch (e) {
        reject(new Error('Failed to send request'));
      }
    });
  }
}

export default App;