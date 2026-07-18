import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2, ArrowLeft, Image as ImageIcon, Palette, MessageSquare, Send, Eye, Share2, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { unifiedUploadService } from '../../services/unifiedUpload';
import { googleDriveService } from '../../services/googleDrive';
import { audioService } from '../../services/audio';
import { confettiService } from '../../services/confetti';
import { doc, getFirestore, updateDoc, collection, getDocs, query, where, arrayUnion } from 'firebase/firestore';
import { ClientGallery, GallerySection, GalleryPhoto } from '../../types';
import GalleryMediaTab from '../../components/admin/gallery/GalleryMediaTab';
import GalleryDesignTab from '../../components/admin/gallery/GalleryDesignTab';
import GalleryCollaborationTab from '../../components/admin/gallery/GalleryCollaborationTab';
import GalleryDeliveryTab from '../../components/admin/gallery/GalleryDeliveryTab';
import GalleryAnalyticsTab from '../../components/admin/gallery/GalleryAnalyticsTab';
import GallerySharingTab from '../../components/admin/gallery/GallerySharingTab';
import GalleryAdminTab from '../../components/admin/gallery/GalleryAdminTab';
import GoogleDriveStatus from '../../components/admin/gallery/GoogleDriveStatus';

export default function GalleryEditor() {
  const navigate = useNavigate();
  const { gallerySlug } = useParams<{ gallerySlug: string }>();
  
  const location = useLocation();
  const slugFromPath = location.pathname.split('/').pop();
  const actualSlug = gallerySlug || slugFromPath;
  
  const [loading, setLoading] = useState(true);
  const [clientGallery, setClientGallery] = useState<ClientGallery | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Upload progress tracking
  const [uploadProgress, setUploadProgress] = useState({
    currentFile: '',
    currentIndex: 0,
    totalFiles: 0,
    fileProgress: 0,
  });
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState<'upload' | 'design' | 'collaboration' | 'delivery' | 'analytics' | 'sharing' | 'admin'>('upload');
  
  // Preview mode
  const [showPreview, setShowPreview] = useState(false);
  
  // Section management
  const [sectionName, setSectionName] = useState('');
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionPhotos, setSectionPhotos] = useState<GalleryPhoto[]>([]);
  
  // Design settings
  const [coverLayout, setCoverLayout] = useState('center');
  const [fontTheme, setFontTheme] = useState('modern');
  const [gridGaps, setGridGaps] = useState(16);
  const [imageSize, setImageSize] = useState('medium');
  const [previewDevice, setPreviewDevice] = useState('mobile');
  
  // Admin settings
  const [password, setPassword] = useState('');
  const [financialStatus, setFinancialStatus] = useState<'paid' | 'pending'>('pending');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [accessType, setAccessType] = useState<'public' | 'password'>('password');
  const [seoIndexing, setSeoIndexing] = useState(true);
  const [downloadPermissions, setDownloadPermissions] = useState({
    allowAlbumDownload: true,
    allowIndividualDownload: true,
    downloadResolution: 'original' as 'original' | 'web',
    downloadPinCode: '',
    enableDownloadPin: false,
  });

  useEffect(() => {
    let mounted = true;
    
    if (actualSlug && mounted) {
      loadGalleryBySlug(actualSlug);
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  const loadGalleryBySlug = async (slug: string) => {
    const forceLoadingFalse = setTimeout(() => {
      setLoading(false);
      toast.error('خطأ في تحميل المعرض - يرجى المحاولة مرة أخرى');
    }, 10000);

    try {
      setLoading(true);
      
      const db = getFirestore();
      const galleriesRef = collection(db, 'client-galleries');
      
      let querySnapshot = await getDocs(query(galleriesRef, where('slug', '==', slug)));
      
      if (querySnapshot.empty && slug) {
        querySnapshot = await getDocs(query(galleriesRef, where('__name__', '==', slug)));
      }
      
      if (querySnapshot.empty) {
        console.error('Gallery not found with slug or id:', slug);
        toast.error('المعرض غير موجود');
        navigate('/admin/websiteadministration/galleries');
        return;
      }
      
      const galleryDoc = querySnapshot.docs[0];
      const galleryData = galleryDoc.data() as ClientGallery;
      const galleryWithId = { ...galleryData, id: galleryDoc.id };
      
      setClientGallery(galleryWithId);
      setSections(galleryData.sections || []);
      setPassword(galleryData.password || '');
      setFinancialStatus(galleryData.financialStatus);
      setAccessType(galleryData.accessType);
      setVisibility((galleryData as any).visibility || 'public');
      setCoverLayout((galleryData as any).designSettings?.coverLayout || 'center');
      setFontTheme((galleryData as any).designSettings?.fontTheme || 'modern');
      setGridGaps((galleryData as any).designSettings?.gridGaps || 16);
      setImageSize((galleryData as any).designSettings?.imageSize || 'medium');
    } catch (error) {
      console.error('Error loading gallery:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      toast.error(`فشل تحميل المعرض: ${errorMessage}`);
      navigate('/admin/websiteadministration/galleries');
    } finally {
      clearTimeout(forceLoadingFalse);
      setLoading(false);
    }
  };

  const createSection = async () => {
    if (!clientGallery || !sectionName || !clientGallery.id) {
      toast.error('يرجى إدخال اسم القسم');
      return;
    }

    // Check if Google Drive is connected - MANDATORY
    if (!clientGallery.driveFolderId) {
      toast.error('يجب ربط المعرض بـ Google Drive قبل إنشاء الأقسام. يرجى التأكد من أن المعرض لديه معرف مجلد Google Drive صالح.');
      return;
    }

    // Verify Google Drive folder access
    try {
      const hasAccess = await googleDriveService.checkFolderAccess(clientGallery.driveFolderId);
      if (!hasAccess) {
        toast.error('لا يمكن الوصول إلى مجلد Google Drive. يرجى التحقق من الصلاحيات والمحاولة مرة أخرى.');
        return;
      }
    } catch (error) {
      console.error('Error checking Google Drive access:', error);
      toast.error('فشل التحقق من الوصول إلى Google Drive');
      return;
    }

    try {
      const subFolder = await googleDriveService.createFolder(clientGallery.driveFolderId, sectionName);
      
      if (!subFolder || !subFolder.id) {
        toast.error('فشل إنشاء المجلد في Google Drive');
        return;
      }
      
      const currentSections = Array.isArray(sections) ? sections : [];
      const newSection: GallerySection = {
        id: `section-${Date.now()}`,
        name: sectionName,
        orderIndex: currentSections.length,
        filesCount: 0,
        visibility: 'client_only',
        driveFolderId: subFolder.id,
        photos: [],
        createdAt: new Date().toISOString(),
      };
      
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', clientGallery.id);
      await updateDoc(galleryRef, {
        sections: arrayUnion(newSection),
        updatedAt: new Date().toISOString(),
      });
      
      if (!audioService.getMuteState()) audioService.playClick();
      
      toast.success('تم إنشاء القسم بنجاح ✅');
      
      setSectionName('');
      setSections([...currentSections, newSection]);
    } catch (error) {
      console.error('Error creating section:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(`فشل إنشاء القسم: ${errorMessage}`);
    }
  };

  const updateGallerySettings = async () => {
    if (!clientGallery || !clientGallery.id) return;

    try {
      setUploading(true);
      
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', clientGallery.id);
      await updateDoc(galleryRef, {
        password,
        financialStatus,
        accessType,
        visibility,
        downloadPermissions,
        designSettings: {
          coverLayout,
          fontTheme,
          gridGaps,
          imageSize,
        },
        updatedAt: new Date().toISOString(),
      });
      
      if (!audioService.getMuteState()) audioService.playClick();
      confettiService.fireCenter();
      
      toast.success('تم تحديث إعدادات المعرض بنجاح ✅');
      
      await loadGalleryBySlug(gallerySlug || '');
    } catch (error) {
      console.error('Error updating gallery:', error);
      toast.error('فشل تحديث الإعدادات');
    } finally {
      setUploading(false);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const section = sections.find(s => s.id === sectionId);
    setSectionPhotos((section?.photos || []) as GalleryPhoto[]);
  };

  const handleSectionDelete = async (sectionId: string) => {
    if (!clientGallery || !clientGallery.id) return;
    
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', clientGallery.id);
      const updatedSections = sections.filter(s => s.id !== sectionId);
      
      await updateDoc(galleryRef, {
        sections: updatedSections,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('تم حذف القسم بنجاح');
      setSections(updatedSections);
      
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
        setSectionPhotos([]);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('فشل حذف القسم');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    console.log('handleFileUpload called with files:', files.length);
    console.log('selectedSectionId:', selectedSectionId);
    console.log('clientGallery:', clientGallery);
    
    if (!selectedSectionId) {
      toast.error('يرجى اختيار قسم أولاً');
      console.error('No section selected');
      return;
    }

    if (!clientGallery) {
      toast.error('المعرض غير موجود');
      console.error('No client gallery');
      return;
    }

    if (!clientGallery.driveFolderId) {
      toast.error('المعرض غير مرتبط بـ Google Drive');
      console.error('No driveFolderId in gallery');
      return;
    }

    try {
      setUploading(true);
      
      const section = sections.find(s => s.id === selectedSectionId);
      console.log('Found section:', section);
      
      if (!section) {
        toast.error('القسم غير موجود');
        console.error('Section not found');
        return;
      }

      if (!section.driveFolderId) {
        toast.error('القسم غير مرتبط بمجلد Google Drive');
        console.error('Section has no driveFolderId');
        return;
      }

      console.log('Starting upload to folder:', section.driveFolderId);
      console.log('Files to upload:', files.length);

      // Check Google Drive access before upload
      const hasAccess = await googleDriveService.checkFolderAccess(section.driveFolderId);
      if (!hasAccess) {
        toast.error('لا يمكن الوصول إلى مجلد Google Drive. يرجى التحقق من الصلاحيات.');
        console.error('No access to Google Drive folder');
        return;
      }

      let successCount = 0;
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      const uploadedPhotos: GalleryPhoto[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(`Uploading file ${i + 1}/${imageFiles.length}:`, file.name);
        
        // Update progress
        setUploadProgress({
          currentFile: file.name,
          currentIndex: i + 1,
          totalFiles: imageFiles.length,
          fileProgress: 0,
        });
        
        try {
          const result = await unifiedUploadService.uploadFile(file, {
            folderId: section.driveFolderId,
            onProgress: (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                fileProgress: progress,
              }));
            },
            compress: true,
            createThumbnail: true,
          }, 'gallery');
          
          console.log('Upload successful:', result);
          successCount++;
          
          // Create photo record
          const photo: GalleryPhoto = {
            id: `photo-${Date.now()}-${i}`,
            name: file.name,
            url: result.url || '',
            driveFileId: result.fileId || '',
            driveWebViewLink: result.url || '',
            driveWebContentLink: result.url || '',
            size: file.size || 0,
            mimeType: file.type || 'image/jpeg',
            uploadedAt: new Date().toISOString(),
          };
          
          // Remove undefined fields
          Object.keys(photo).forEach(key => {
            if (photo[key as keyof GalleryPhoto] === undefined) {
              delete photo[key as keyof GalleryPhoto];
            }
          });
          
          uploadedPhotos.push(photo);
          
          // Update progress to 100% for this file
          setUploadProgress(prev => ({
            ...prev,
            fileProgress: 100,
          }));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`فشل رفع ${file.name}`);
        }
      }
      
      // Save photos to Firestore
      if (uploadedPhotos.length > 0) {
        try {
          const db = getFirestore();
          const galleryRef = doc(db, 'client-galleries', clientGallery.id);
          
          console.log('Saving photos to Firestore for gallery:', clientGallery.id);
          console.log('Selected section ID:', selectedSectionId);
          console.log('Current sections:', sections);
          console.log('Uploaded photos:', uploadedPhotos);
          
          // Update section with new photos
          const updatedSections = sections.map(s => {
            if (s.id === selectedSectionId) {
              console.log('Updating section:', s.id, 'with', uploadedPhotos.length, 'new photos');
              const updatedSection = {
                ...s,
                photos: [...(s.photos || []), ...uploadedPhotos],
                filesCount: (s.filesCount || 0) + uploadedPhotos.length,
              };
              
              // Remove undefined fields from section
              const cleanedSection: Record<string, any> = {};
              Object.keys(updatedSection).forEach(key => {
                const value = (updatedSection as any)[key];
                if (value !== undefined) {
                  cleanedSection[key] = value;
                }
              });
              
              return cleanedSection as GallerySection;
            }
            return s;
          });
          
          console.log('Updated sections to save:', updatedSections);
          
          await updateDoc(galleryRef, {
            sections: updatedSections,
            updatedAt: new Date().toISOString(),
          });
          
          console.log('Photos saved to Firestore successfully:', uploadedPhotos.length);
          
          // Update local state
          setSections(updatedSections);
          setSectionPhotos([...sectionPhotos, ...uploadedPhotos]);
          
          toast.success(`تم رفع ${successCount} صورة بنجاح ✅`);
        } catch (error) {
          console.error('Error saving photos to Firestore:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast.error('تم رفع الصور لكن فشل حفظها في قاعدة البيانات');
        }
      } else {
        toast.error('لم يتم رفع أي صورة');
      }
      
      // Reset progress
      setUploadProgress({
        currentFile: '',
        currentIndex: 0,
        totalFiles: 0,
        fileProgress: 0,
      });
      
      // Reload gallery to get updated sections - use clientGallery.id instead of slug
      if (clientGallery?.id) {
        await loadGalleryBySlug(clientGallery.id);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل رفع الصور';
      toast.error(`فشل رفع الصور: ${errorMessage}`);
      
      // Reset progress on error
      setUploadProgress({
        currentFile: '',
        currentIndex: 0,
        totalFiles: 0,
        fileProgress: 0,
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async (_photoId: string) => {
    // Implement photo deletion logic
    toast.info('سيتم حذف الصورة');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Loader2 size={48} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'upload' as const, label: 'الميديا', icon: ImageIcon },
    { id: 'design' as const, label: 'التصميم', icon: Palette },
    { id: 'collaboration' as const, label: 'التعاون', icon: MessageSquare },
    { id: 'delivery' as const, label: 'التسليم', icon: Send },
    { id: 'analytics' as const, label: 'التحليلات', icon: Eye },
    { id: 'sharing' as const, label: 'المشاركة', icon: Share2 },
    { id: 'admin' as const, label: 'الصلاحيات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] p-4 md:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-slate-600/20 to-pink-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/15 to-slate-600/15 rounded-full blur-[180px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin/websiteadministration/galleries')}
            className="flex items-center gap-2 text-white hover:text-slate-400 transition-all hover:scale-105"
          >
            <ArrowLeft size={24} />
            <span>العودة</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {clientGallery?.clientName || 'المعرض'}
          </h1>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 text-slate-400 rounded-xl hover:bg-black/50 transition-all hover:scale-105 shadow-lg"
          >
            <Eye size={20} />
            <span>{showPreview ? 'تحرير' : 'معاينة'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-4 shadow-xl transition-all hover:scale-[1.01]">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-black/50 border border-blue-500/30 text-slate-300'
                        : 'bg-black/20 border border-white/5 text-gray-300 hover:bg-black/30'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Google Drive Status - Hide in preview mode */}
            {!showPreview && clientGallery && (
              <div className="mb-4">
                <GoogleDriveStatus 
                  driveFolderId={clientGallery.driveFolderId}
                  onStatusChange={(connected) => {
                    if (!connected) {
                      toast.warning('Google Drive غير متصل. بعض الميزات قد تكون محدودة.');
                    }
                  }}
                />
              </div>
            )}

            {/* Show connection required message if not connected */}
            {!showPreview && clientGallery && !clientGallery.driveFolderId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-xl transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">يجب ربط Google Drive أولاً</h2>
                <p className="text-gray-400 mb-6">
                  لكي تتمكن من إدارة المعرض ورفع الصور، يجب عليك ربط المعرض بـ Google Drive أولاً.
                </p>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all hover:scale-105 font-medium shadow-lg shadow-blue-500/20"
                >
                  الذهاب للإعدادات للربط
                </button>
              </motion.div>
            )}

            {/* Show content only if connected or in preview mode */}
            {(showPreview || (clientGallery && clientGallery.driveFolderId)) && (
              <>
                {showPreview && clientGallery ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">معاينة المعرض</h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewDevice('mobile')}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            previewDevice === 'mobile' 
                              ? 'bg-black/50 text-slate-300 border border-blue-500/30' 
                              : 'bg-black/20 border border-white/5 text-gray-300 hover:bg-black/30'
                          }`}
                        >
                          Mobile
                        </button>
                        <button
                          onClick={() => setPreviewDevice('tablet')}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            previewDevice === 'tablet' 
                              ? 'bg-black/50 text-slate-300 border border-blue-500/30' 
                              : 'bg-black/20 border border-white/5 text-gray-300 hover:bg-black/30'
                          }`}
                        >
                          Tablet
                        </button>
                        <button
                          onClick={() => setPreviewDevice('desktop')}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            previewDevice === 'desktop' 
                              ? 'bg-black/50 text-slate-300 border border-blue-500/30' 
                              : 'bg-black/20 border border-white/5 text-gray-300 hover:bg-black/30'
                          }`}
                        >
                          Desktop
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mx-auto border-4 border-gray-700 rounded-lg overflow-hidden ${
                      previewDevice === 'mobile' ? 'w-full max-w-sm' :
                      previewDevice === 'tablet' ? 'w-full max-w-2xl' :
                      'w-full'
                    }`}>
                      <div className="bg-gray-900 min-h-[600px] p-4">
                        <div className="text-center text-gray-400 py-20">
                          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                          <p>معاينة المعرض</p>
                          <p className="text-sm mt-2">العميل: {clientGallery?.clientName}</p>
                          <p className="text-sm">عدد الأقسام: {sections.length}</p>
                          <p className="text-sm">التخطيط: {coverLayout}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl transition-all hover:scale-[1.01]"
                  >
              {activeTab === 'upload' && (
                <GalleryMediaTab
                  sections={sections}
                  selectedSectionId={selectedSectionId}
                  sectionPhotos={sectionPhotos}
                  sectionName={sectionName}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  onSectionNameChange={setSectionName}
                  onCreateSection={createSection}
                  onSectionSelect={handleSectionSelect}
                  onSectionDelete={handleSectionDelete}
                  onFileUpload={handleFileUpload}
                  onPhotoDelete={handlePhotoDelete}
                />
              )}

              {activeTab === 'design' && (
                <GalleryDesignTab
                  coverLayout={coverLayout}
                  fontTheme={fontTheme}
                  gridGaps={gridGaps}
                  imageSize={imageSize}
                  previewDevice={previewDevice}
                  onCoverLayoutChange={setCoverLayout}
                  onFontThemeChange={setFontTheme}
                  onGridGapsChange={setGridGaps}
                  onImageSizeChange={setImageSize}
                  onPreviewDeviceChange={setPreviewDevice}
                />
              )}

              {activeTab === 'collaboration' && (
                <GalleryCollaborationTab clientGallery={clientGallery} />
              )}

              {activeTab === 'delivery' && (
                <GalleryDeliveryTab clientGallery={clientGallery} />
              )}

              {activeTab === 'analytics' && (
                <GalleryAnalyticsTab clientGallery={clientGallery} />
              )}

              {activeTab === 'sharing' && (
                <GallerySharingTab clientGallery={clientGallery} password={password} />
              )}

              {activeTab === 'admin' && (
                <GalleryAdminTab
                  clientGallery={clientGallery}
                  password={password}
                  financialStatus={financialStatus}
                  visibility={visibility}
                  accessType={accessType}
                  seoIndexing={seoIndexing}
                  downloadPermissions={downloadPermissions}
                  onPasswordChange={setPassword}
                  onFinancialStatusChange={setFinancialStatus}
                  onVisibilityChange={setVisibility}
                  onAccessTypeChange={setAccessType}
                  onSeoIndexingChange={setSeoIndexing}
                  onDownloadPermissionsChange={setDownloadPermissions}
                  onSaveSettings={updateGallerySettings}
                  uploading={uploading}
                />
              )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
