-- Create Storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-galleries', 'public-galleries', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-deliveries', 'client-deliveries', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public-galleries bucket
CREATE POLICY "Public galleries public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'public-galleries');

CREATE POLICY "Authenticated can upload to public galleries" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'public-galleries' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can delete from public galleries" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'public-galleries' AND 
  auth.role() = 'authenticated'
);

-- Storage policies for client-deliveries bucket
CREATE POLICY "Client deliveries public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'client-deliveries');

CREATE POLICY "Authenticated can upload to client deliveries" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'client-deliveries' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can delete from client deliveries" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'client-deliveries' AND 
  auth.role() = 'authenticated'
);
