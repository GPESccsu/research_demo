import { createContext, useContext } from "react";

export const AIConfigContext = createContext(null);

export function useAIConfig() {
  return useContext(AIConfigContext);
}
