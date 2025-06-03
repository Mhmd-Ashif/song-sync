import { toast } from "sonner";
export default function loadingToast(title: string) {
  toast(
    <div className="relative flex items-center space-x-2">
      <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-violet-400 opacity-75"></span>
      <span className="relative text-white">{title}</span>
    </div>
  );
}
