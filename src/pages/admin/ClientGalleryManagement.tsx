import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FolderPlus,
  Download,
  Trash2,
  Eye,
  Grid3X3,
  List,
  Search,
  Filter,
  Share2,
  Copy,
  Link as LinkIcon,
  MessageCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button, Input } from '../../design-system/components';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system/components';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { uploadMultiplePhotos, getEventPhotos, deletePhoto } from '../../services/clientGallery';

export function ClientGalleryManagement() {
  console.log('🔍 ClientGalleryManagement component loaded');
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);

  const folders = ['hall', 'session', 'outdoor'];

  const db = getFirestore();

  // Generate unique gallery ID
  const generateGalleryId = () => {
    return `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load clients from Firestore
  useEffect(() => {
    console.log('🔄 useEffect triggered - loading clients');
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      console.log('📥 Loading clients from Firestore...');
      const clientsRef = collection(db, 'clients');
      const snapshot = await getDocs(clientsRef);
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Clients loaded:', clientsData.length, clientsData);
      setClients(clientsData);
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      // Fallback to mock data if Firestore fails
      console.log('⚠️ Using mock data for clients');
      setClients([
        { id: 'client1', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+201234567890' },
        { id: 'client2', name: 'سارة علي', email: 'sara@example.com', phone: '+201098765432' },
      ]);
    }
  };

  // Load events for selected client
  useEffect(() => {
    if (selectedClient) {
      loadEvents(selectedClient);
    }
  }, [selectedClient]);

  const loadEvents = async (clientId: string) => {
    try {
      const eventsRef = collection(db, 'bookings');
      const q = query(eventsRef, where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to mock data if Firestore fails
      setEvents([
        { id: 'event1', clientId: clientId, title: 'فرح أحمد ومحمد', date: '2024-01-15' },
        { id: 'event2', clientId: clientId, title: 'خطوبة سارة', date: '2024-02-20' },
      ]);
    }
  };

  useEffect(() => {
    if (selectedEvent && selectedFolder) {
      loadPhotos();
    }
  }, [selectedEvent, selectedFolder]);

  const loadPhotos = async () => {
    try {
      if (!selectedEvent) return;
      const eventPhotos = await getEventPhotos(selectedEvent, selectedFolder || undefined);
      setPhotos(eventPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedClient || !selectedEvent || !selectedFolder) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedPhotos = await uploadMultiplePhotos(
        selectedClient,
        selectedEvent,
        selectedFolder,
        Array.from(files),
        (progress) => setUploadProgress(progress)
      );
      setPhotos([...photos, ...uploadedPhotos]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الصور. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      await deletePhoto(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('حدث خطأ أثناء حذف الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  // Create gallery for client
  const handleCreateGallery = async () => {
    if (!selectedClient || !selectedEvent || !selectedFolder) {
      alert('يرجى اختيار العميل والحدث والمجلد أولاً');
      return;
    }

    if (photos.length === 0) {
      alert('يرجى رفع صور أولاً قبل إنشاء المعرض');
      return;
    }

    setIsCreatingGallery(true);

    try {
      const newGalleryId = generateGalleryId();
      const client = clients.find(c => c.id === selectedClient);
      const event = events.find(e => e.id === selectedEvent);

      console.log('📝 Creating gallery with data:', { newGalleryId, selectedClient, selectedEvent, selectedFolder });

      const galleryData = {
        id: newGalleryId,
        clientId: selectedClient,
        clientName: client?.name || 'Unknown',
        clientEmail: client?.email || '',
        clientPhone: client?.phone || '',
        eventId: selectedEvent,
        eventTitle: event?.title || 'Unknown',
        eventDate: event?.date || new Date().toISOString(),
        folder: selectedFolder,
        photos: photos.map(p => ({
          id: p.id,
          name: p.fileName,
          size: p.metadata?.size || 0,
          uploadedAt: new Date().toISOString(),
          title: p.fileName,
          url: p.urls?.raw || ''
        })),
        imagekitPaths: photos.map(p => p.imagekitPath || ''),
        imagekitFileIds: photos.map(p => p.imagekitFileId || ''),
        createdAt: new Date().toISOString(),
        hasPasswordProtection: true,
        passwordHash: btoa('1234'), // Default password, should be customizable
        allowDownload: true,
        viewCount: 0,
        status: 'active'
      };

      console.log('💾 Saving gallery to Firestore:', galleryData);
      await setDoc(doc(db, 'galleries', newGalleryId), galleryData);
      console.log('✅ Gallery saved successfully');
      
      setGalleryId(newGalleryId);
      setShowShareModal(true);
      alert('تم إنشاء المعرض بنجاح!');
    } catch (error) {
      console.error('❌ Error creating gallery:', error);
      alert('حدث خطأ أثناء إنشاء المعرض: ' + (error as Error).message);
    } finally {
      setIsCreatingGallery(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    if (!galleryId) return;

    const galleryUrl = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(galleryUrl);
    setCopiedToClipboard(true);

    setTimeout(() => {
      setCopiedToClipboard(false);
    }, 2000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!galleryId) return;

    const client = clients.find(c => c.id === selectedClient);
    const galleryUrl = `${window.location.origin}/gallery/${galleryId}`;
    const message = `مرحباً ${client?.name}، تم إعداد معرض الصور الخاص بك. يمكنك رؤيته على الرابط التالي:\n${galleryUrl}\nكلمة المرور: 1234`;

    const whatsappUrl = `https://wa.me/${client?.phone?.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredPhotos = photos.filter(photo =>
    photo.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('🎨 Rendering ClientGalleryManagement UI');
  console.log('📊 State:', { selectedClient, selectedEvent, selectedFolder, clients: clients.length, events: events.length, photos: photos.length });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إدارة معارض العملاء</h1>
          <p className="text-gray-400">رفع وإدارة صور العملاء</p>
        </div>

        {/* Selection Panel */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          {/* Client Selection */}
          <Card variant="glass" className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedClient || ''}
                onChange={(e) => {
                  setSelectedClient(e.target.value || null);
                  setSelectedEvent(null);
                  setSelectedFolder(null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              >
                <option value="">اختر عميل</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Event Selection */}
          <Card variant="glass" className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">الحدث</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedEvent || ''}
                onChange={(e) => {
                  setSelectedEvent(e.target.value || null);
                  setSelectedFolder(null);
                }}
                disabled={!selectedClient}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white disabled:opacity-50"
              >
                <option value="">اختر حدث</option>
                {events
                  .filter(event => !selectedClient || event.clientId === selectedClient)
                  .map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
              </select>
            </CardContent>
          </Card>

          {/* Folder Selection */}
          <Card variant="glass" className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">المجلد</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                disabled={!selectedEvent}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white disabled:opacity-50"
              >
                <option value="">اختر مجلد</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>
                    {folder === 'hall' ? 'القاعة' : folder === 'session' ? 'الجلسة' : 'خارجي'}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card variant="glass" className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">رفع صور</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={!selectedClient || !selectedEvent || !selectedFolder || isUploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/20 cursor-pointer transition-all ${
                  !selectedClient || !selectedEvent || !selectedFolder || isUploading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-orange-500 hover:bg-orange-500/10'
                }`}
              >
                <Upload size={20} />
                <span className="text-sm">{isUploading ? 'جاري الرفع...' : 'اختر صور'}</span>
              </label>
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Gallery */}
          <Card variant="glass" className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">إنشاء معرض</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateGallery}
                disabled={!selectedClient || !selectedEvent || !selectedFolder || photos.length === 0 || isCreatingGallery}
                className="w-full"
                variant="primary"
              >
                {isCreatingGallery ? 'جاري الإنشاء...' : 'إنشاء معرض للعميل'}
              </Button>
              {galleryId && (
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="ghost"
                  className="w-full mt-2"
                >
                  <Share2 size={16} className="ml-2" />
                  مشاركة المعرض
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Photos Grid */}
        {selectedClient && selectedEvent && selectedFolder && (
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="بحث في الصور..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={18} />}
                  className="w-64"
                />
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 size={18} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </Button>
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                {filteredPhotos.length} صورة
              </div>
            </div>

            {filteredPhotos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">لا توجد صور بعد</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <img
                        src={photo.urls.thumbnail}
                        alt={photo.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(photo.urls.preview, '_blank')}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={photo.urls.thumbnail}
                      alt={photo.fileName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm">{photo.fileName}</p>
                      <p className="text-gray-400 text-xs">
                        {(photo.metadata.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePhoto(photo.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && galleryId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">مشاركة المعرض</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">رابط المعرض</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/gallery/${galleryId}`}
                      readOnly
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="ghost"
                      size="sm"
                    >
                      {copiedToClipboard ? <CheckCircle size={20} className="text-green-400" /> : <Copy size={20} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">كلمة المرور</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                    1234
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleShareWhatsApp}
                    variant="primary"
                    className="flex-1"
                  >
                    <MessageCircle size={20} className="ml-2" />
                    إرسال عبر واتساب
                  </Button>
                  <Button
                    onClick={() => window.open(`/gallery/${galleryId}`, '_blank')}
                    variant="ghost"
                    className="flex-1"
                  >
                    <LinkIcon size={20} className="ml-2" />
                    فتح المعرض
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
