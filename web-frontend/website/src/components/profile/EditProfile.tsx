// EditProfileModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Modal, Box, Typography, TextField, Button, IconButton,
  Chip, Divider, Stack, Avatar, CircularProgress,
} from "@mui/material";
import CloseRoundedIcon       from "@mui/icons-material/CloseRounded";
import AddRoundedIcon         from "@mui/icons-material/AddRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PersonRoundedIcon      from "@mui/icons-material/PersonRounded";
import WorkRoundedIcon        from "@mui/icons-material/WorkRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CameraAltRoundedIcon   from "@mui/icons-material/CameraAltRounded";

// ── Anchor palette tokens ────────────────────────────────────────────────────
const C = {
  accent:      "#b87444",
  accentDark:  "#a0622e",
  accentBg:    "rgba(184,116,68,0.07)",
  accentBorder:"rgba(184,116,68,0.18)",
  accentFaint: "rgba(184,116,68,0.10)",
  accentHover: "rgba(184,116,68,0.06)",
  accentGrad:  "linear-gradient(135deg, #b87444, #a0622e)",
  cardBg:      "#ffffff",
  surface:     "#fdfaf7",
  divider:     "#e8ddd0",
  textPrimary: "#2c1a0a",
  textSub:     "#8c6a50",
  textMuted:   "#b8a090",
} as const;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontSize: 14,
    background: "#fdfaf7", transition: "all 0.18s",
    "& fieldset": { borderColor: C.divider },
    "&:hover fieldset": { borderColor: C.accentBorder },
    "&.Mui-focused": {
      background: C.accentBg,
      "& fieldset": { borderColor: C.accent, borderWidth: 1.5 },
    },
  },
  "& .MuiInputLabel-root": { fontSize: 13, color: C.textSub },
  "& .MuiInputLabel-root.Mui-focused": { color: C.accent },
};

// ─── Tag pill input ───────────────────────────────────────────────────────────
function TagInput({ label, hint, values, onChange, suggestions = [] }: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const add = (val?: string) => {
    const v = (val ?? input).trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    if (!val) setInput("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));
  const filtered = suggestions.filter((s) => input && s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s));

  return (
    <Box>
      <Typography fontSize={12} fontWeight={600} sx={{ color: C.textSub, mb: 1, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </Typography>

      {values.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1.25 }}>
          {values.map((v) => (
            <Chip key={v} label={v} size="small" onDelete={() => remove(v)} sx={{
              height: 28, fontSize: 13, fontWeight: 500,
              background: C.accentBg, color: C.accent,
              border: `1px solid ${C.accentBorder}`, borderRadius: "8px",
              "& .MuiChip-deleteIcon": { color: C.accent, opacity: 0.55, fontSize: 15, "&:hover": { opacity: 1 } },
            }} />
          ))}
        </Box>
      )}

      <Box sx={{ position: "relative" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField size="small" fullWidth placeholder={hint ?? "Type and press Enter…"}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            onBlur={() => { if (input.trim()) add(); }}
            sx={fieldSx}
          />
          <IconButton onClick={() => add()} size="small" sx={{
            width: 36, height: 36, background: C.accentBg,
            border: `1px solid ${C.accentBorder}`, color: C.accent,
            borderRadius: "10px", flexShrink: 0,
            "&:hover": { background: C.accentFaint },
          }}>
            <AddRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {filtered.length > 0 && (
          <Box sx={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 44,
            background: "#fff", border: `1px solid ${C.accentBorder}`,
            borderRadius: "10px", boxShadow: "0 8px 24px rgba(44,26,10,0.10)",
            zIndex: 100, overflow: "hidden",
          }}>
            {filtered.slice(0, 5).map((s) => (
              <Box key={s} onMouseDown={() => add(s)} sx={{
                px: 1.75, py: 1, fontSize: 13, cursor: "pointer", color: C.textPrimary,
                "&:hover": { background: C.accentBg, color: C.accent },
              }}>
                {s}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Typography fontSize={12} fontWeight={600} sx={{ color: C.textSub, mb: 1, textTransform: "uppercase", letterSpacing: 0.6 }}>
      {children}
    </Typography>
  );
}

// ─── Resume section ───────────────────────────────────────────────────────────
function ResumeSection({ form, set, onResumeFile }: {
  form: EditableProfile;
  set: <K extends keyof EditableProfile>(k: K, v: EditableProfile[K]) => void;
  onResumeFile: (f: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab]         = useState<"upload" | "paste">(form.resumeText && !form.resumeUrl ? "paste" : "upload");
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    onResumeFile(file);
    set("resumeName", file.name);
    set("resumeUrl", URL.createObjectURL(file));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Box>
      <Box sx={{ display: "inline-flex", background: C.surface, borderRadius: "10px", p: "3px", mb: 2.5, border: `1px solid ${C.divider}` }}>
        {(["upload", "paste"] as const).map((t) => (
          <Box key={t} onClick={() => setTab(t)} sx={{
            px: 2, py: 0.75, borderRadius: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.16s",
            color: tab === t ? C.accent : C.textSub,
            background: tab === t ? "#fff" : "transparent",
            boxShadow: tab === t ? "0 1px 6px rgba(44,26,10,0.08)" : "none",
            border: tab === t ? `1px solid ${C.accentBorder}` : "1px solid transparent",
          }}>
            {t === "upload" ? "Upload File" : "Paste Text"}
          </Box>
        ))}
      </Box>

      {tab === "upload" ? (
        <Box>
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            sx={{
              border: `2px dashed ${dragging ? C.accent : C.accentBorder}`,
              borderRadius: "14px",
              background: dragging ? C.accentBg : C.surface,
              py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              cursor: "pointer", transition: "all 0.18s",
              "&:hover": { background: C.accentBg, borderColor: C.accent },
            }}
          >
            <Box sx={{ width: 48, height: 48, borderRadius: "12px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CloudUploadRoundedIcon sx={{ color: C.accent, fontSize: 24 }} />
            </Box>
            <Typography fontWeight={600} fontSize={14} sx={{ color: C.textPrimary }}>
              {form.resumeName ?? "Drop your resume here"}
            </Typography>
            <Typography fontSize={12} sx={{ color: C.textMuted }}>PDF, DOCX — or click to browse</Typography>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                // Allow the same file to be selected again later.
                e.currentTarget.value = "";
              }} />
          </Box>

          {form.resumeName && (
            <Box sx={{
              mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 2, py: 1.25, background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: "10px",
            }}>
              <Typography fontSize={13} fontWeight={600} sx={{ color: C.accent }}>📄 {form.resumeName}</Typography>
              <IconButton size="small" onClick={(event) => {
                event.stopPropagation();
                onResumeFile(null);
                set("resumeName", null);
                set("resumeUrl", null);
                if (fileRef.current) fileRef.current.value = "";
              }}
                sx={{ color: C.textMuted, "&:hover": { color: "#dc2626" }, p: 0.5 }}>
                <CloseRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        <TextField multiline rows={7} fullWidth
          placeholder="Paste your resume content here. Our AI will parse and use it for insights…"
          value={form.resumeText ?? ""} onChange={(e) => set("resumeText", e.target.value || null)}
          sx={{ ...fieldSx, "& .MuiOutlinedInput-root": { ...fieldSx["& .MuiOutlinedInput-root"], alignItems: "flex-start", fontSize: 13, lineHeight: 1.7 } }}
        />
      )}
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type EditableProfile = {
  name: string; email: string; location: string; avatarUrl: string | null;
  primaryFocus: string[]; resumeName: string | null; resumeUrl: string | null;
  resumeText: string | null; preferredRoles: string[]; status: string[];
  intrests: string[]; employmentType: string[];
};

type Props = {
  open: boolean; onClose: () => void;
  profile: Partial<EditableProfile>;
  onSave: (updated: EditableProfile, avatarFile: File | null, resumeFile: File | null, removeAvatar: boolean) => void;
  saving?: boolean;
  saveError?: string;
  onChangePassword?: () => void;
  onForgotPassword?: () => void;
};

const TABS = [
  { label: "Profile", icon: <PersonRoundedIcon      sx={{ fontSize: 16 }} /> },
  { label: "Career",  icon: <WorkRoundedIcon        sx={{ fontSize: 16 }} /> },
  { label: "Resume",  icon: <DescriptionRoundedIcon sx={{ fontSize: 16 }} /> },
];

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function EditProfileModal({ open, onClose, profile, onSave, saving = false, saveError = "", onChangePassword, onForgotPassword }: Props) {
  const [tab, setTab]                     = useState(0);
  const avatarRef                         = useRef<HTMLInputElement>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingResumeFile, setPendingResumeFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar]   = useState(false);

  const [form, setForm] = useState<EditableProfile>({
    name: "", email: "", location: "", avatarUrl: null,
    primaryFocus: [], resumeName: null, resumeUrl: null, resumeText: null,
    preferredRoles: [], status: [], intrests: [], employmentType: [],
  });

  useEffect(() => {
    if (open) {
      setTab(0); setPendingAvatarFile(null); setPendingResumeFile(null); setRemoveAvatar(false);
      setForm({
        name: profile.name ?? "", email: profile.email ?? "", location: profile.location ?? "",
        avatarUrl: profile.avatarUrl ?? null, primaryFocus: profile.primaryFocus ?? [],
        resumeName: profile.resumeName ?? null, resumeUrl: profile.resumeUrl ?? null,
        resumeText: profile.resumeText ?? null, preferredRoles: profile.preferredRoles ?? [],
        status: profile.status ?? [], intrests: profile.intrests ?? [], employmentType: profile.employmentType ?? [],
      });
    }
  }, [open, profile]);

  const set = <K extends keyof EditableProfile>(k: K, v: EditableProfile[K]) => setForm((p) => ({ ...p, [k]: v }));
  const handleAvatarFile = (file: File) => { setPendingAvatarFile(file); setRemoveAvatar(false); set("avatarUrl", URL.createObjectURL(file)); };
  const handleRemoveAvatar = () => { setRemoveAvatar(true); setPendingAvatarFile(null); set("avatarUrl", null); };
  const handleSave = () => onSave(form, pendingAvatarFile, pendingResumeFile, removeAvatar);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: { xs: "95vw", sm: 540 }, maxHeight: "88vh",
        display: "flex", flexDirection: "column",
        background: "#fff", borderRadius: "20px",
        boxShadow: "0 32px 80px rgba(44,26,10,0.16)",
        outline: "none", overflow: "hidden",
        border: `1px solid ${C.divider}`,
      }}>
        {/* HEADER */}
        <Box sx={{
          px: 3, pt: 3, pb: 0,
          background: "linear-gradient(135deg, #fdfaf7 0%, #ffffff 100%)",
          borderBottom: `1px solid ${C.divider}`,
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
            <Box>
              <Typography fontWeight={800} fontSize={22} sx={{ color: C.textPrimary, letterSpacing: "-0.4px", fontFamily: "'Playfair Display', serif" }}>
                Edit Profile
              </Typography>
              <Typography fontSize={13} sx={{ color: C.textSub, mt: 0.25 }}>
                Keep your profile fresh and up to date
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: C.textSub, borderRadius: "10px", "&:hover": { background: C.accentBg, color: C.accent } }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {TABS.map((t, i) => (
              <Box key={t.label} onClick={() => setTab(i)} sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                px: 2, py: 1, borderRadius: "10px 10px 0 0",
                cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.16s",
                color: tab === i ? C.accent : C.textSub,
                background: tab === i ? "#fff" : "transparent",
                borderTop:   tab === i ? `2px solid ${C.accent}` : "2px solid transparent",
                borderLeft:  tab === i ? `1px solid ${C.divider}` : "1px solid transparent",
                borderRight: tab === i ? `1px solid ${C.divider}` : "1px solid transparent",
                mb: tab === i ? "-1px" : 0,
                "&:hover": { color: C.accent, background: tab === i ? "#fff" : C.accentBg },
              }}>
                {t.icon}{t.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* BODY */}
        <Box sx={{
          flex: 1, overflowY: "auto", px: 3, py: 3,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { background: C.accentBorder, borderRadius: 4 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
        }}>
          {/* TAB 0: PROFILE */}
          <Box sx={{ display: tab === 0 ? "block" : "none" }}>
            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    src={form.avatarUrl ?? undefined}
                    sx={{ width: 80, height: 80, borderRadius: "18px", border: `2px solid ${C.accentBorder}`, bgcolor: C.accentBg, color: C.accent, fontSize: 28, fontWeight: 700 }}
                  >
                    {!form.avatarUrl && (form.name?.[0]?.toUpperCase() || null)}
                  </Avatar>
                  <Box onClick={() => avatarRef.current?.click()} sx={{
                    position: "absolute", inset: 0, borderRadius: "18px",
                    background: "rgba(44,26,10,0.42)", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.18s", cursor: "pointer", "&:hover": { opacity: 1 },
                  }}>
                    <CameraAltRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
                  </Box>
                  <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]); }} />
                </Box>
                <Box>
                  <Typography fontWeight={600} fontSize={14} sx={{ color: C.textPrimary }}>Profile Photo</Typography>
                  <Typography fontSize={12} sx={{ color: C.textSub, mt: 0.25, mb: 1 }}>Hover the photo and click to upload</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" onClick={() => avatarRef.current?.click()} sx={{
                      textTransform: "none", fontWeight: 600, fontSize: 12, px: 1.5, py: 0.5, borderRadius: "8px",
                      color: C.accent, border: `1px solid ${C.accentBorder}`, background: C.accentBg,
                      "&:hover": { background: C.accentFaint },
                    }}>
                      Choose photo
                    </Button>
                    {(form.avatarUrl || profile.avatarUrl) && !removeAvatar && (
                      <Button size="small" onClick={handleRemoveAvatar} sx={{
                        textTransform: "none", fontWeight: 600, fontSize: 12, px: 1.5, py: 0.5, borderRadius: "8px",
                        color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)", background: "rgba(220,38,38,0.05)",
                        "&:hover": { background: "rgba(220,38,38,0.10)", borderColor: "rgba(220,38,38,0.45)" },
                      }}>
                        Remove photo
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: C.divider }} />

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Label>Full Name</Label>
                  <TextField size="small" fullWidth placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} sx={fieldSx} />
                </Box>
              </Box>

              <Box>
                <Label>Email</Label>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={Boolean(saveError)}
                  helperText={saveError || undefined}
                  sx={fieldSx}
                />
                <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                  <Button size="small" onClick={onChangePassword} sx={{ color: C.accent, textTransform: "none", p: 0 }}>
                    Change password
                  </Button>
                  <Button size="small" onClick={onForgotPassword} sx={{ color: C.textSub, textTransform: "none", p: 0 }}>
                    Forgot password?
                  </Button>
                </Box>
              </Box>

              <Box>
                <Label>Location</Label>
                <TextField size="small" fullWidth placeholder="e.g. San Francisco, CA" value={form.location} onChange={(e) => set("location", e.target.value)} sx={fieldSx} />
              </Box>

              <TagInput label="Primary Focus" hint="e.g. Full-Stack, Machine Learning…" values={form.primaryFocus} onChange={(v) => set("primaryFocus", v)}
                suggestions={["Full-Stack","Frontend","Backend","Machine Learning","DevOps","Mobile","Data Science","Cloud"]} />
            </Stack>
          </Box>

          {/* TAB 1: CAREER */}
          <Box sx={{ display: tab === 1 ? "block" : "none" }}>
            <Stack spacing={3}>
              <TagInput label="Status" hint="e.g. Open to work, Actively interviewing…" values={form.status} onChange={(v) => set("status", v)}
                suggestions={["Open to work","Actively interviewing","Employed","Freelancing","Not looking"]} />
              <Divider sx={{ borderColor: C.divider }} />
              <TagInput label="Employment Type" hint="e.g. Full-time, Contract, Remote…" values={form.employmentType} onChange={(v) => set("employmentType", v)}
                suggestions={["Full-time","Part-time","Contract","Internship","Remote","Hybrid","On-site"]} />
              <Divider sx={{ borderColor: C.divider }} />
              <TagInput label="Preferred Roles" hint="e.g. SWE, Frontend Engineer…" values={form.preferredRoles} onChange={(v) => set("preferredRoles", v)}
                suggestions={["Software Engineer","Frontend Engineer","Backend Engineer","Full-Stack Engineer","ML Engineer","Data Scientist","Product Manager","DevOps Engineer"]} />
              <Divider sx={{ borderColor: C.divider }} />
              <TagInput label="Industry Interests" hint="e.g. Fintech, AI, Healthcare…" values={form.intrests} onChange={(v) => set("intrests", v)}
                suggestions={["AI / ML","Fintech","Healthcare","EdTech","SaaS","Gaming","Cybersecurity","Climate Tech","E-commerce"]} />
            </Stack>
          </Box>

          {/* TAB 2: RESUME */}
          <Box sx={{ display: tab === 2 ? "block" : "none" }}>
            <ResumeSection form={form} set={set} onResumeFile={setPendingResumeFile} />
          </Box>
        </Box>

        {/* FOOTER */}
        <Box sx={{
          px: 3, py: 2.25, borderTop: `1px solid ${C.divider}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: C.surface,
        }}>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {TABS.map((_, i) => (
              <Box key={i} onClick={() => setTab(i)} sx={{
                width: tab === i ? 20 : 7, height: 7, borderRadius: "4px",
                background: tab === i ? C.accent : C.accentBorder,
                cursor: "pointer", transition: "all 0.22s",
              }} />
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1.25 }}>
            <Button onClick={onClose} sx={{
              textTransform: "none", fontWeight: 600, fontSize: 13, px: 2.5, py: 1, borderRadius: "10px",
              color: C.textSub, border: `1px solid ${C.divider}`,
              "&:hover": { background: C.accentBg, borderColor: C.accentBorder, color: C.accent },
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} sx={{
              textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, py: 1, borderRadius: "10px",
              background: saving ? "rgba(44,26,10,0.08)" : C.accentGrad,
              color: saving ? C.textSub : "#fff",
              boxShadow: saving ? "none" : "0 4px 14px rgba(184,116,68,0.28)",
              transition: "all 0.2s",
              "&:hover": {
                background: saving ? "rgba(44,26,10,0.08)" : "linear-gradient(135deg, #a0622e, #8a4a1e)",
                boxShadow: saving ? "none" : "0 4px 20px rgba(184,116,68,0.38)",
              },
            }}>
              {saving ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} sx={{ color: C.textSub }} />
                  Saving…
                </Box>
              ) : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
