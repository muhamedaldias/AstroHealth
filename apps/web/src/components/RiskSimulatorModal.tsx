import type React from "react";
import type { Astronaut, Language } from "../types";
import { RiskSimulatorPanel } from "./RiskSimulatorPanel";

interface RiskSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  astronaut: Astronaut;
  lang: Language;
}

export const RiskSimulatorModal: React.FC<RiskSimulatorModalProps> = ({
  isOpen,
  onClose,
  astronaut,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D223A]/40 backdrop-blur-md animate-fade-in">
      <div className="max-w-lg w-full max-h-full overflow-y-auto">
        <RiskSimulatorPanel astronaut={astronaut} lang={lang} onClose={onClose} />
      </div>
    </div>
  );
};
