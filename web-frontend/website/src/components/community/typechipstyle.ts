import { C } from "./constants";
import { ForumPost } from "./Types";

export const typeChipStyle = (type: ForumPost["type"]) => {
  switch (type) {
    case "Achievement":
      return { bgcolor: "rgba(63,125,79,0.10)", color: C.green };
    case "Doubt":
      return { bgcolor: "rgba(184,68,68,0.08)", color: C.red };
    default:
      return { bgcolor: C.accentFaint, color: C.accentDark };
  }
};
