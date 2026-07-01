import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firestoreData } from '../services/firestoreData';
import { toast } from 'sonner';

export function usePageContent(pageId: string) {
  return useQuery({
    queryKey: ['pageContent', pageId],
    queryFn: () => firestoreData.getPageContent(pageId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSavePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, content }: { pageId: string; content: any }) =>
      firestoreData.savePageContent(pageId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pageContent', variables.pageId] });
      toast.success('تم حفظ التغييرات بنجاح!');
    },
    onError: (error: Error) => {
      toast.error(`فشل الحفظ: ${error.message}`);
    },
  });
}

export function useMultiplePageContent(pageIds: string[]) {
  return useQuery({
    queryKey: ['pageContent', 'multiple', pageIds],
    queryFn: async () => {
      const promises = pageIds.map(id => firestoreData.getPageContent(id));
      const results = await Promise.all(promises);
      return results;
    },
    staleTime: 5 * 60 * 1000,
  });
}
