export interface ExportData {
  bookings: any[];
  clients: any[];
  galleries: any[];
  transactions: any[];
}

export class ExportImportService {
  // Export data to CSV
  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export data to JSON
  static exportToJSON(data: any, filename: string) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import data from CSV
  static importFromCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              // Remove quotes if present
              const value = values[index]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '';
              obj[header.trim()] = value;
            });
            return obj;
          });
          resolve(data.filter(row => Object.values(row).some(v => v)));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Import data from JSON
  static importFromJSON(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const data = JSON.parse(jsonContent);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Export all data
  static exportAllData(data: ExportData) {
    this.exportToJSON(data, `backup_${new Date().toISOString().split('T')[0]}`);
  }

  // Validate imported data
  static validateData(data: any, schema: any): boolean {
    // Basic validation - can be extended
    return data !== null && typeof data === 'object';
  }
}
