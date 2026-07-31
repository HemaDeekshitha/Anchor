"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  Stack,
  Avatar,
  Divider,
  Button,
  TextField,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Checkbox,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Radio,
  RadioGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { CommunityVisibility } from "@/lib/community-api";

import {
  Community,
  CommunityLayout,
  CommunitySectionTab,
  CreateCommunityFormInput,
  Friend,
  ScheduledMeeting,
} from "./Types";
import { ALL_ID, C } from "./constants";
import ScheduleMeetings from "./Schedulemeetings";

// NOTE: `isOwner` / `isAdmin` are not on the shared Community type yet — this
// is a forward-compatible local shape so the Delete/admin UI can be built now
// and wired up as soon as the backend/Types.ts include real values. Until
// then both flags are `undefined`, so the Delete action stays hidden for
// everyone (the safe default).
type CommunityWithRole = Community & { isOwner?: boolean; isAdmin?: boolean };

const CommunitiesView = ({
  communities,
  friends,
  meetings,
  onJoin,
  onCreate,
  onOpen,
  onDelete,
}: {
  communities: Community[];
  friends: Friend[];
  meetings: ScheduledMeeting[];
  onJoin: (communityId: string) => Promise<void>;
  onCreate: (
    input: CreateCommunityFormInput
  ) => Promise<{ community: Community; inviteLink: string | null }>;
  onOpen: (communityId: string) => void;
  onDelete?: (communityId: string) => Promise<void>;
}) => {
  const [section, setSection] = useState<CommunitySectionTab>("current");
  const [layout, setLayout] = useState<CommunityLayout>("grid");
  const [scheduleCommunityId, setScheduleCommunityId] =
    useState<string>(ALL_ID);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityPost, setCommunityPost] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [shareLink, setShareLink] = useState(true);
  const [visibility, setVisibility] = useState<CommunityVisibility>("public");
  const [createdMessage, setCreatedMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Community | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const joinedCommunities = communities.filter((community) => community.joined);
  const scheduleCommunity = joinedCommunities.find(
    (community) => community.id === scheduleCommunityId
  );
  const normalizedSearch = search.trim().toLowerCase();
  const discoverableCommunities = communities.filter((community) => {
    if (!normalizedSearch) return true;
    return `${community.name} ${community.description}`
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const invitableFriends = friends.filter((friend) => friend.isFriend);

  const handleSectionChange = (
    _event: React.SyntheticEvent,
    value: CommunitySectionTab
  ) => {
    setSection(value);
    setCreatedMessage("");
  };
  // T: O(1) and S: O(1)

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriendIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId]
    );
    // An un-invited friend can't stay marked as admin.
    setSelectedAdminIds((current) => current.filter((id) => id !== friendId));
  };
  // T: O(f) and S: O(f), where f is the number of selected friends

  const handleAdminToggle = (friendId: string) => {
    if (!selectedFriendIds.includes(friendId)) return;
    setSelectedAdminIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId]
    );
  };
  // T: O(a) and S: O(a), where a is the number of selected admins

  const handleCreate = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || creating) return;
    setCreating(true);
    setFormError("");
    setCreatedMessage("");
    try {
      const result = await onCreate({
        name: normalizedTitle,
        description: description.trim() || "A new Anchor community",
        visibility,
        friendIds: selectedFriendIds,
        firstPost: communityPost.trim(),
        createShareLink: shareLink,
      });
      setCreatedMessage(
        result.inviteLink
          ? `${normalizedTitle} was created. Invite link: ${result.inviteLink}`
          : `${normalizedTitle} was created.`
      );
      setTitle("");
      setDescription("");
      setCommunityPost("");
      setSelectedFriendIds([]);
      setSelectedAdminIds([]);
      setVisibility("public");
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Could not create community"
      );
    } finally {
      setCreating(false);
    }
  };
  // T: O(t + f) and S: O(t + f), where t is text length and f is selected friends

  const handleJoin = async (communityId: string) => {
    if (joiningId) return;
    setJoiningId(communityId);
    setFormError("");
    try {
      await onJoin(communityId);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Could not join community"
      );
    } finally {
      setJoiningId("");
    }
  };
  // T: O(1) and S: O(1)

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting || !onDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (caught) {
      setDeleteError(
        caught instanceof Error ? caught.message : "Could not delete community"
      );
    } finally {
      setDeleting(false);
    }
  };
  // T: O(1) and S: O(1)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          sx={{
            color: C.textPrimary,
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.55rem",
            fontWeight: 700,
          }}
        >
          Communities
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.9rem", mt: 0.5 }}>
          Keep up with your groups, discover new people, or start a space of
          your own.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${C.divider}`,
          boxShadow: "0 4px 18px rgba(44,26,10,0.05)",
        }}
      >
        <Tabs
          value={section}
          onChange={handleSectionChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            px: 1,
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTabs-indicator": { bgcolor: C.accent },
            "& .MuiTab-root": {
              color: C.textMuted,
              textTransform: "none",
              fontWeight: 600,
            },
            "& .Mui-selected": { color: `${C.accentDark} !important` },
          }}
        >
          <Tab
            value="current"
            label={`Current (${joinedCommunities.length})`}
          />
          <Tab value="join" label="Join a community" />
          <Tab value="create" label="Create a community" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {section === "current" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
                gap: 3,
                alignItems: "start",
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: C.textPrimary,
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      Your communities
                    </Typography>
                    <Typography
                      sx={{ color: C.textMuted, fontSize: "0.76rem", mt: 0.2 }}
                    >
                      Select one to schedule a discussion.
                    </Typography>
                  </Box>
                  <Box
                    role="group"
                    aria-label="Community layout"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: `1px solid ${C.divider}`,
                    }}
                  >
                    <Tooltip title="Grid view">
                      <IconButton
                        aria-label="Grid view"
                        onClick={() => setLayout("grid")}
                        size="small"
                        sx={{
                          color:
                            layout === "grid" ? C.textPrimary : C.textMuted,
                          borderRadius: 0,
                          borderBottom:
                            layout === "grid"
                              ? `2px solid ${C.accent}`
                              : "2px solid transparent",
                        }}
                      >
                        <GridViewRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="List view">
                      <IconButton
                        aria-label="List view"
                        onClick={() => setLayout("list")}
                        size="small"
                        sx={{
                          color:
                            layout === "list" ? C.textPrimary : C.textMuted,
                          borderRadius: 0,
                          borderBottom:
                            layout === "list"
                              ? `2px solid ${C.accent}`
                              : "2px solid transparent",
                        }}
                      >
                        <ViewListRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      layout === "grid"
                        ? { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }
                        : "1fr",
                    gap: layout === "grid" ? 1.5 : 0,
                  }}
                >
                  {joinedCommunities.map((community) => {
                    const isSelected = community.id === scheduleCommunityId;
                    const role = community as CommunityWithRole;
                    const canManage = Boolean(
                      onDelete && (role.isOwner || role.isAdmin)
                    );
                    return (
                      <Box
                        key={community.id}
                        onClick={() => setScheduleCommunityId(community.id)}
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.3,
                          p: layout === "grid" ? 2 : 1.5,
                          border: 0,
                          borderBottom:
                            layout === "list"
                              ? `1px solid ${C.divider}`
                              : "none",
                          borderRadius: layout === "grid" ? 2 : 0,
                          bgcolor: isSelected ? C.accentFaint : "#fff",
                          boxShadow:
                            layout === "grid"
                              ? `inset 0 0 0 1px ${
                                  isSelected ? C.accent : C.divider
                                }`
                              : "none",
                          color: C.textPrimary,
                          font: "inherit",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                          "&:hover": { bgcolor: C.accentHover },
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isSelected ? "#fff" : C.accentFaint,
                            color: C.accentDark,
                            flexShrink: 0,
                          }}
                        >
                          <GroupsRoundedIcon fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: C.textPrimary,
                              fontSize: "0.88rem",
                              fontWeight: 700,
                            }}
                          >
                            {community.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: C.textMuted,
                              fontSize: "0.74rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {community.description} · {community.memberCount}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {community.visibility === "private" ? (
                              <LockOutlinedIcon
                                sx={{ fontSize: 13, color: C.textMuted }}
                              />
                            ) : (
                              <PublicRoundedIcon
                                sx={{ fontSize: 13, color: C.textMuted }}
                              />
                            )}
                            <Typography
                              sx={{ color: C.textMuted, fontSize: "0.68rem" }}
                            >
                              {community.visibility === "private"
                                ? "Private"
                                : "Public"}
                            </Typography>
                          </Box>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{ flexShrink: 0 }}
                        >
                          <Button
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpen(community.id);
                            }}
                            sx={{ color: C.accentDark, textTransform: "none" }}
                          >
                            Open
                          </Button>
                          {canManage && (
                            <Tooltip title="Delete community">
                              <IconButton
                                aria-label={`Delete ${community.name}`}
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeleteError("");
                                  setDeleteTarget(community);
                                }}
                                sx={{
                                  color: C.textMuted,
                                  "&:hover": { color: C.red },
                                }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <ScheduleMeetings
                meetings={meetings}
                activeCommunityId={scheduleCommunityId}
                activeCommunityName={scheduleCommunity?.name}
              />
            </Box>
          )}

          {section === "join" && (
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search communities by name or topic"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: C.textMuted }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: C.surface,
                    "& fieldset": { borderColor: C.divider },
                  },
                }}
              />

              <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
                {discoverableCommunities.map((community) => (
                  <Box
                    key={community.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1.6,
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: C.accentFaint,
                        color: C.accentDark,
                        flexShrink: 0,
                      }}
                    >
                      <GroupsRoundedIcon />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ color: C.textPrimary, fontWeight: 700 }}
                      >
                        {community.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.textMuted,
                          fontSize: "0.78rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {community.description} · {community.memberCount}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.textMuted,
                          fontSize: "0.7rem",
                          mt: 0.25,
                        }}
                      >
                        {community.visibility === "private"
                          ? "Private · invitation required"
                          : "Public"}
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => handleJoin(community.id)}
                      disabled={community.joined || Boolean(joiningId)}
                      variant={community.joined ? "text" : "contained"}
                      sx={{
                        minWidth: 82,
                        borderRadius: 2,
                        bgcolor: community.joined ? "transparent" : C.accent,
                        color: community.joined ? C.green : "#fff",
                        textTransform: "none",
                        boxShadow: "none",
                      }}
                    >
                      {community.joined
                        ? "Joined"
                        : joiningId === community.id
                        ? "Joining…"
                        : "Join"}
                    </Button>
                  </Box>
                ))}
                {discoverableCommunities.length === 0 && (
                  <Typography
                    sx={{ color: C.textMuted, textAlign: "center", py: 4 }}
                  >
                    No communities match “{search}”.
                  </Typography>
                )}
              </Stack>
              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
          )}

          {section === "create" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.75fr" },
                gap: 3,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Title"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Frontend Interview Prep"
                />
                <TextField
                  label="Description"
                  multiline
                  minRows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tell people what this community is about"
                />
                <Box>
                  <Typography
                    sx={{
                      color: C.textPrimary,
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    Who can join?
                  </Typography>
                  <RadioGroup
                    row
                    value={visibility}
                    onChange={(event) =>
                      setVisibility(event.target.value as CommunityVisibility)
                    }
                  >
                    <FormControlLabel
                      value="public"
                      control={
                        <Radio
                          sx={{
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label="Public"
                    />
                    <FormControlLabel
                      value="private"
                      control={
                        <Radio
                          sx={{
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label="Private"
                    />
                  </RadioGroup>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.74rem" }}>
                    {visibility === "public"
                      ? "Anyone can find and join this community."
                      : "Only people with an invitation can join."}
                  </Typography>
                </Box>
                <TextField
                  label="Post about the community"
                  multiline
                  minRows={3}
                  value={communityPost}
                  onChange={(event) => setCommunityPost(event.target.value)}
                  placeholder="Write the first welcome post or announcement"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={shareLink}
                      onChange={(event) => setShareLink(event.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: C.accent,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          { bgcolor: C.accent },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{ color: C.textPrimary, fontSize: "0.88rem" }}
                      >
                        Create a shareable invite link
                      </Typography>
                      <Typography
                        sx={{ color: C.textMuted, fontSize: "0.74rem" }}
                      >
                        You can copy and share it after creating the community.
                      </Typography>
                    </Box>
                  }
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  disabled={!title.trim() || creating}
                  onClick={handleCreate}
                  sx={{
                    alignSelf: "flex-start",
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: C.accent,
                    textTransform: "none",
                    boxShadow: "none",
                  }}
                >
                  {creating ? "Creating…" : "Create community"}
                </Button>
                {formError && <Alert severity="error">{formError}</Alert>}
                {createdMessage && (
                  <Typography
                    role="status"
                    sx={{
                      color: C.green,
                      fontWeight: 600,
                      fontSize: "0.84rem",
                    }}
                  >
                    {createdMessage}
                  </Typography>
                )}
              </Stack>

              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: C.divider,
                  borderRadius: 2.5,
                  boxShadow: "none",
                  alignSelf: "start",
                }}
              >
                <Typography
                  sx={{
                    color: C.textPrimary,
                    fontWeight: 700,
                    mb: 0.4,
                  }}
                >
                  Add your friends
                </Typography>
                <Typography
                  sx={{ color: C.textMuted, fontSize: "0.76rem", mb: 1.5 }}
                >
                  Selected friends will receive an invitation. Mark anyone as an
                  admin so they can help manage the community.
                </Typography>
                {invitableFriends.length === 0 ? (
                  <Typography
                    sx={{ color: C.textMuted, fontSize: "0.8rem", py: 1 }}
                  >
                    Add friends first to invite them here.
                  </Typography>
                ) : (
                  <Stack spacing={0.25}>
                    {invitableFriends.map((friend) => {
                      const isInvited = selectedFriendIds.includes(friend.id);
                      const isAdmin = selectedAdminIds.includes(friend.id);
                      return (
                        <Box
                          key={friend.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            py: 0.6,
                            px: 0.5,
                            mx: -0.5,
                            borderRadius: 1.5,
                            cursor: "pointer",
                            "&:hover": { bgcolor: C.accentHover },
                          }}
                          onClick={() => handleFriendToggle(friend.id)}
                        >
                          <Checkbox
                            size="small"
                            checked={isInvited}
                            tabIndex={-1}
                            disableRipple
                            sx={{
                              p: 0.5,
                              color: C.divider,
                              pointerEvents: "none",
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              ml: 0.5,
                              mr: 1,
                              bgcolor: C.accentFaint,
                              color: C.accentDark,
                              fontSize: "0.75rem",
                            }}
                          >
                            {friend.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                color: C.textPrimary,
                                fontSize: "0.82rem",
                                fontWeight: 600,
                              }}
                            >
                              {friend.name}
                            </Typography>
                            <Typography
                              sx={{ color: C.textMuted, fontSize: "0.7rem" }}
                            >
                              {friend.handle}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<ShieldRoundedIcon sx={{ fontSize: 14 }} />}
                            label={isAdmin ? "Admin" : "Make admin"}
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAdminToggle(friend.id);
                            }}
                            disabled={!isInvited}
                            sx={{
                              flexShrink: 0,
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              bgcolor: isAdmin ? C.accentFaint : "transparent",
                              color: isAdmin ? C.accentDark : C.textMuted,
                              border: `1px solid ${
                                isAdmin ? C.accent : C.divider
                              }`,
                              "& .MuiChip-icon": {
                                color: isAdmin ? C.accentDark : C.textMuted,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
                {selectedAdminIds.length > 0 && (
                  <Typography
                    sx={{ color: C.textMuted, fontSize: "0.7rem", mt: 1 }}
                  >
                    Admin assignment will take effect once backend support for
                    community admins is added.
                  </Typography>
                )}
                {shareLink && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      mt: 1.5,
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: C.accentFaint,
                      color: C.accentDark,
                    }}
                  >
                    <LinkRoundedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      Invite link will be generated
                    </Typography>
                  </Box>
                )}
              </Card>
            </Box>
          )}
        </Box>
      </Card>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Delete {deleteTarget?.name}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
            This removes the community, its posts, and its conversation for
            every member. This action cannot be undone.
          </Typography>
          {deleteError && (
            <Typography sx={{ color: C.red, fontSize: "0.78rem", mt: 1.5 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            {deleting ? "Deleting…" : "Delete community"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
// T: O(c + f) and S: O(c + f), where c is communities and f is friends

export default CommunitiesView;
