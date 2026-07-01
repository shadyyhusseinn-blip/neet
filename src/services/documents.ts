// Document Management Service

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'receipt' | 'agreement' | 'other';
  category: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: number;
  uploadedBy: string;
  metadata: {
    customerId?: string;
    bookingId?: string;
    expiryDate?: string;
    tags: string[];
  };
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'receipt' | 'agreement';
  content: string;
  variables: string[];
  createdAt: number;
  updatedAt: number;
}

export class DocumentService {
  private static documents: Document[] = [];
  private static templates: DocumentTemplate[] = [];

  // Initialize document service
  static initialize(): void {
    // Load documents from localStorage
    const storedDocs = localStorage.getItem('documents');
    if (storedDocs) {
      try {
        this.documents = JSON.parse(storedDocs);
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    }

    // Load templates from localStorage
    const storedTemplates = localStorage.getItem('document_templates');
    if (storedTemplates) {
      try {
        this.templates = JSON.parse(storedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    }
  }

  // Upload document
  static async uploadDocument(
    file: File,
    metadata: Document['metadata']
  ): Promise<Document> {
    try {
      // In production, this would upload to cloud storage
      const url = await this.uploadToStorage(file);

      const document: Document = {
        id: this.generateDocumentId(),
        name: file.name,
        type: this.detectDocumentType(file.name),
        category: this.detectCategory(file.name),
        fileSize: file.size,
        mimeType: file.type,
        url,
        uploadedAt: Date.now(),
        uploadedBy: 'current-user', // Would be actual user ID
        metadata,
      };

      this.documents.push(document);
      this.saveDocuments();

      return document;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // Upload to storage (simulated)
  private static async uploadToStorage(file: File): Promise<string> {
    // In production, this would upload to AWS S3, Google Drive, etc.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  // Detect document type
  private static detectDocumentType(filename: string): Document['type'] {
    const lower = filename.toLowerCase();
    if (lower.includes('contract')) return 'contract';
    if (lower.includes('invoice')) return 'invoice';
    if (lower.includes('receipt')) return 'receipt';
    if (lower.includes('agreement')) return 'agreement';
    return 'other';
  }

  // Detect category
  private static detectCategory(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('wedding')) return 'wedding';
    if (lower.includes('portrait')) return 'portrait';
    if (lower.includes('event')) return 'event';
    if (lower.includes('commercial')) return 'commercial';
    return 'general';
  }

  // Generate document ID
  private static generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all documents
  static getDocuments(filter?: {
    type?: Document['type'];
    category?: string;
    customerId?: string;
    bookingId?: string;
  }): Document[] {
    let filtered = [...this.documents];

    if (filter?.type) {
      filtered = filtered.filter((doc) => doc.type === filter.type);
    }

    if (filter?.category) {
      filtered = filtered.filter((doc) => doc.category === filter.category);
    }

    if (filter?.customerId) {
      filtered = filtered.filter((doc) => doc.metadata.customerId === filter.customerId);
    }

    if (filter?.bookingId) {
      filtered = filtered.filter((doc) => doc.metadata.bookingId === filter.bookingId);
    }

    // Sort by upload date (newest first)
    filtered.sort((a, b) => b.uploadedAt - a.uploadedAt);

    return filtered;
  }

  // Get document by ID
  static getDocumentById(id: string): Document | undefined {
    return this.documents.find((doc) => doc.id === id);
  }

  // Delete document
  static async deleteDocument(id: string): Promise<boolean> {
    try {
      const doc = this.getDocumentById(id);
      if (!doc) return false;

      // Delete from storage
      await this.deleteFromStorage(doc.url);

      this.documents = this.documents.filter((d) => d.id !== id);
      this.saveDocuments();

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  // Delete from storage (simulated)
  private static async deleteFromStorage(url: string): Promise<void> {
    // In production, this would delete from cloud storage
    console.log('Deleting from storage:', url);
  }

  // Save documents to localStorage
  private static saveDocuments(): void {
    try {
      localStorage.setItem('documents', JSON.stringify(this.documents));
    } catch (error) {
      console.error('Failed to save documents:', error);
    }
  }

  // Create document from template
  static createFromTemplate(
    templateId: string,
    data: Record<string, any>
  ): string {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');

    let content = template.content;

    // Replace variables
    template.variables.forEach((variable) => {
      const value = data[variable] || '';
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return content;
  }

  // Create template
  static createTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): DocumentTemplate {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: this.generateTemplateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.templates.push(newTemplate);
    this.saveTemplates();

    return newTemplate;
  }

  // Update template
  static updateTemplate(id: string, updates: Partial<DocumentTemplate>): DocumentTemplate | null {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveTemplates();
    return this.templates[index];
  }

  // Delete template
  static deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveTemplates();
    return true;
  }

  // Get all templates
  static getTemplates(): DocumentTemplate[] {
    return [...this.templates];
  }

  // Get template by ID
  static getTemplateById(id: string): DocumentTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }

  // Generate template ID
  private static generateTemplateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save templates to localStorage
  private static saveTemplates(): void {
    try {
      localStorage.setItem('document_templates', JSON.stringify(this.templates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  // Search documents
  static searchDocuments(query: string): Document[] {
    const lowerQuery = query.toLowerCase();
    return this.documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lowerQuery) ||
        doc.category.toLowerCase().includes(lowerQuery) ||
        doc.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get documents by tags
  static getDocumentsByTags(tags: string[]): Document[] {
    return this.documents.filter((doc) =>
      doc.metadata.tags.some((tag) => tags.includes(tag))
    );
  }

  // Archive document
  static archiveDocument(id: string): boolean {
    const doc = this.getDocumentById(id);
    if (!doc) return false;

    // In production, this would move to archive storage
    console.log('Archiving document:', id);
    return true;
  }

  // Get document statistics
  static getStatistics(): {
    totalDocuments: number;
    documentsByType: Record<string, number>;
    documentsByCategory: Record<string, number>;
    totalSize: number;
    recentUploads: number;
  } {
    const documentsByType: Record<string, number> = {};
    const documentsByCategory: Record<string, number> = {};
    let totalSize = 0;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentUploads = this.documents.filter(
      (doc) => doc.uploadedAt >= oneWeekAgo
    ).length;

    this.documents.forEach((doc) => {
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1;
      documentsByCategory[doc.category] = (documentsByCategory[doc.category] || 0) + 1;
      totalSize += doc.fileSize;
    });

    return {
      totalDocuments: this.documents.length,
      documentsByType,
      documentsByCategory,
      totalSize,
      recentUploads,
    };
  }

  // Download document
  static downloadDocument(id: string): void {
    const doc = this.getDocumentById(id);
    if (!doc) return;

    const a = document.createElement('a');
    a.href = doc.url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Preview document
  static previewDocument(id: string): string | null {
    const doc = this.getDocumentById(id);
    if (!doc) return null;
    return doc.url;
  }
}

export const documentService = DocumentService;
