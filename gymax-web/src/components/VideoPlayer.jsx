function youtubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/** لینک‌های آپارات: aparat.com/v/XXXX یا لینک embed */
function aparatId(url) {
  const match = url.match(/aparat\.com\/(?:v\/|video\/video\/embed\/videohash\/)([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

function Frame({ src }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
      <iframe className="h-full w-full" src={src} title="فیلم آموزشی" allowFullScreen />
    </div>
  );
}

/** url می‌تونه لینک یوتیوب، آپارات، لینک مستقیم فایل یا لینک امضاشده‌ی فایل آپلودی باشه */
export default function VideoPlayer({ url }) {
  if (!url) return null;

  const aparat = aparatId(url);
  if (aparat) return <Frame src={`https://www.aparat.com/video/video/embed/videohash/${aparat}/vt/frame`} />;

  const youtube = youtubeId(url);
  if (youtube) return <Frame src={`https://www.youtube.com/embed/${youtube}`} />;

  return (
    <video
      className="aspect-video w-full rounded-2xl border border-line bg-black"
      src={url}
      controls
      preload="metadata"
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
