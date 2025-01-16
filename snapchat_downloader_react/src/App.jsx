import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, Coffee } from 'lucide-react';

const App = () => {
  const [groupedLinks, setGroupedLinks] = useState({});
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState({ years: [], months: [] });
  const [workerCount, setWorkerCount] = useState(3);

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
      inProgress: true
    });

    const downloadWorker = new DownloadWorker(workerCount);
    downloadWorker.onProgress = (completed, failed) => {
      setDownloadStatus(prev => ({
        ...prev,
        completed,
        failed
      }));
    };

    downloadWorker.onComplete = () => {
      setDownloadStatus(prev => ({
        ...prev,
        inProgress: false
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
              <a href="https://github.com/yourusername/repo" 
                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Github size={20} />
                <span className="text-sm">GitHub</span>
              </a>
              <a href="https://buymeacoffee.com/yourusername"
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
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">🔒 Privacy First: Your Data Stays Private</h2>
              <ul className="space-y-2">
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
                          {Object.entries(months).map(([month, links]) => (
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

          {/* Download Status */}
          {downloadStatus && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Download Progress</h3>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round((downloadStatus.completed / downloadStatus.total) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {downloadStatus.completed} of {downloadStatus.total} files completed
                    {downloadStatus.failed > 0 && ` (${downloadStatus.failed} failed)`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
            This tool is not affiliated with, endorsed by, or sponsored by Snapchat. 
            Snapchat is a registered trademark of Snap Inc.
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
    this.onProgress = () => {};
    this.onComplete = () => {};
  }

  async addToQueue(urls) {
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
      } finally {
        this.activeDownloads--;
        this.onProgress(this.completed, this.failed);
        
        if (this.queue.length > 0) {
          this.processQueue();
        } else if (this.activeDownloads === 0) {
          this.onComplete();
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

              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              document.body.appendChild(iframe);
              
              iframe.contentWindow.document.write(`
                <a download href="${mediaUrl}">Download</a>
                <script>
                  document.querySelector('a').click();
                  window.parent.postMessage('download-started', '*');
                </script>
              `);
              
              setTimeout(() => {
                document.body.removeChild(iframe);
                resolve();
              }, 1000);
              
            } catch (e) {
              reject(new Error('Failed to process download'));
            }
          } else {
            reject(new Error(`Failed with status ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(parts[1]);
    });
  }
}

export default App;