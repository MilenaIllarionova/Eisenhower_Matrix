import { t } from '../../i18n/ru';

export default function OAuthRow() {
  return (
    <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm text-white/60 w-full">
      <span>{t.auth.or}</span>
      <div className="flex items-center gap-10">
        <button type="button" className="flex items-center gap-2 hover:text-white transition" disabled>
          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#4285F4]">
            G
          </span>
          Google
        </button>
        <button type="button" className="flex items-center gap-2 hover:text-white transition" disabled>
          <span className="w-7 h-7 rounded-md bg-[#0077FF] flex items-center justify-center text-[10px] font-bold text-white">
            VK
          </span>
          Vk
        </button>
        <button type="button" className="flex items-center gap-2 hover:text-white transition" disabled>
          <span className="w-7 h-7 rounded-md bg-white" />
          Other
        </button>
      </div>
    </div>
  );
}