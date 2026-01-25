import { XIcon, UserIcon, EnvelopeIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

export function UserSettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-200 min-h-screen ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-105 bg-white z-201 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900">Meu Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition"
          >
            <XIcon size={20} weight="bold" className="text-neutral-400" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-88px)]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-24 h-24 rounded-3xl bg-neutral-900 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              FS
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              Alterar foto
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <input
                  type="text"
                  defaultValue="Fabrício Code"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                E-mail
              </label>
              <div className="relative">
                <EnvelopeIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <input
                  type="email"
                  defaultValue="fabricio@code.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition shadow-lg shadow-neutral-200 active:scale-95">
              Salvar Alterações
            </button>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="w-full py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
