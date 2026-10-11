// A template (unlike a layout) re-mounts on every navigation, so this plays a
// short fade-and-rise each time you move between pages. It is plain CSS, so it
// needs no JavaScript and is switched off for people who prefer reduced motion.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
