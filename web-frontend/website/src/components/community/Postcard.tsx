"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Stack,
  Avatar,
  Chip,
  Divider,
  Button,
  TextField,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Radio,
  Typography,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import {
  createComment,
  listComments,
  removeFriend,
  sendFriendRequest,
  updatePost,
  deletePost,
  votePoll,
  votePost,
} from "@/lib/community-api";
import { C } from "./constants";
import { ForumComment, ForumPost } from "./Types";
import { formatTimeAgo } from "./utils";
import { typeChipStyle } from "./typechipstyle";

const PostCard = ({
  post,
  communityName,
  onUpdated,
  onDeleted,
}: {
  post: ForumPost;
  communityName?: string;
  onUpdated: (postId: string, body: string) => void;
  onDeleted: (postId: string) => void;
}) => {
  const [comments, setComments] = useState<ForumComment[]>(
    post.initialComments ?? []
  );
  const [showComments, setShowComments] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [poll, setPoll] = useState(post.poll);
  const [votingOptionId, setVotingOptionId] = useState("");
  const [selectedPollOptionIds, setSelectedPollOptionIds] = useState<string[]>(
    post.poll?.viewerOptionIds ?? []
  );
  const [pollError, setPollError] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(
    Boolean(post.initialComments?.length)
  );
  const [friendshipStatus, setFriendshipStatus] = useState(
    post.friendshipStatus
  );
  const [friendActionPending, setFriendActionPending] = useState(false);
  const [liked, setLiked] = useState(post.viewerVote === 1);
  const [likeCount, setLikeCount] = useState(Number(post.upvotes) || 0);
  const [likePending, setLikePending] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [displayBody, setDisplayBody] = useState(post.body);
  const [ownerMenuAnchor, setOwnerMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [postActionPending, setPostActionPending] = useState(false);
  const [postActionError, setPostActionError] = useState("");
  const [editWindowOpen, setEditWindowOpen] = useState(
    Date.now() - new Date(post.createdAt).getTime() < 5 * 60 * 1000
  );
  const pollClosed = Boolean(
    poll &&
      (poll.status === "closed" ||
        (poll.endsAt && new Date(poll.endsAt).getTime() <= Date.now()))
  );

  useEffect(() => {
    setPoll(post.poll);
    setSelectedPollOptionIds(post.poll?.viewerOptionIds ?? []);
    setPollError("");
  }, [post.poll]);
  // T: O(1) and S: O(1)

  useEffect(() => {
    setFriendshipStatus(post.friendshipStatus);
  }, [post.friendshipStatus]);
  // T: O(1) and S: O(1)

  useEffect(() => {
    const remaining =
      new Date(post.createdAt).getTime() + 5 * 60 * 1000 - Date.now();
    if (remaining <= 0) {
      setEditWindowOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setEditWindowOpen(false), remaining);
    return () => window.clearTimeout(timer);
  }, [post.createdAt]);
  // T: O(1) and S: O(1)

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || replying) return;
    setReplying(true);
    setReplyError("");
    try {
      await createComment(post.id, trimmed);
      setComments((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          authorName: "You",
          body: trimmed,
          timeAgo: "Just now",
        },
      ]);
      setReplyText("");
    } catch (caught) {
      setReplyError(
        caught instanceof Error ? caught.message : "Could not add reply"
      );
    } finally {
      setReplying(false);
    }
  };
  // T: O(c) and S: O(c), where c is the number of displayed comments

  const submitPollVote = async (
    optionIds: string[],
    loadingOptionId: string
  ) => {
    if (!poll || votingOptionId) return;
    const previousPoll = poll;
    const previousOptionIds = poll.viewerOptionIds;
    const previousOptionIdSet = new Set(previousOptionIds);
    const nextOptionIdSet = new Set(optionIds);
    const optimisticOptions = poll.options.map((option) => ({
      ...option,
      voteCount: Math.max(
        0,
        option.voteCount +
          (nextOptionIdSet.has(option.id) ? 1 : 0) -
          (previousOptionIdSet.has(option.id) ? 1 : 0)
      ),
    }));
    setVotingOptionId(loadingOptionId);
    setPollError("");
    setPoll({
      ...poll,
      options: optimisticOptions,
      viewerOptionIds: optionIds,
    });
    setSelectedPollOptionIds(optionIds);
    try {
      const options = await votePoll(poll.id, optionIds);
      setPoll({ ...poll, options, viewerOptionIds: optionIds });
      setSelectedPollOptionIds(optionIds);
    } catch (caught) {
      setPoll(previousPoll);
      setSelectedPollOptionIds(previousOptionIds);
      setPollError(
        caught instanceof Error ? caught.message : "Could not submit vote"
      );
    } finally {
      setVotingOptionId("");
    }
  };
  // T: O(o) and S: O(o), where o is the number of poll options

  const handlePollOptionClick = (optionId: string) => {
    if (!poll || pollClosed || votingOptionId) return;
    if (!poll.allowsMultiple) {
      void submitPollVote(
        selectedPollOptionIds.includes(optionId) ? [] : [optionId],
        optionId
      );
      return;
    }
    setSelectedPollOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };
  // T: O(o) and S: O(o), where o is the number of selected poll options

  const handleMultiplePollVote = () => {
    void submitPollVote(selectedPollOptionIds, "multiple");
  };
  // T: O(o) and S: O(o), where o is the number of selected poll options

  const handleToggleComments = async () => {
    const nextVisible = !showComments;
    setShowComments(nextVisible);
    if (!nextVisible || commentsLoaded) return;
    setReplyError("");
    try {
      const records = await listComments(post.id);
      setComments(
        records.map((comment) => ({
          id: comment.id,
          authorName: comment.author?.name ?? "Anchor member",
          body: comment.body,
          timeAgo: formatTimeAgo(comment.createdAt),
        }))
      );
      setCommentsLoaded(true);
    } catch (caught) {
      setReplyError(
        caught instanceof Error ? caught.message : "Could not load replies"
      );
    }
  };
  // T: O(c) and S: O(c), where c is returned comments

  const handleAddFriend = async () => {
    if (friendshipStatus !== "none" || friendActionPending) return;
    setFriendActionPending(true);
    setActionMessage("");
    try {
      await sendFriendRequest(post.authorId);
      setFriendshipStatus("pending");
    } catch (caught) {
      setActionMessage(
        caught instanceof Error ? caught.message : "Could not add friend"
      );
    } finally {
      setFriendActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleLike = async () => {
    if (likePending) return;
    const nextLiked = !liked;
    setLikePending(true);
    setActionMessage("");
    try {
      const result = await votePost(post.id, nextLiked ? 1 : 0);
      setLiked(nextLiked);
      setLikeCount(result.upvotes);
    } catch (caught) {
      setActionMessage(
        caught instanceof Error ? caught.message : "Could not update like"
      );
    } finally {
      setLikePending(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleSharePost = async () => {
    const url = `${window.location.origin}/community?post=${encodeURIComponent(
      post.id
    )}`;
    setActionMessage("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.authorName} on Anchor`,
          text: post.body,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setActionMessage("Post link copied.");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError")
        return;
      setActionMessage("Could not share this post.");
    }
  };
  // T: O(b) and S: O(b), where b is the post text length

  const handleMenuShare = async () => {
    setOwnerMenuAnchor(null);
    await handleSharePost();
  };
  // T: O(b) and S: O(b), where b is the post text length

  const handleCopyPostLink = async () => {
    setOwnerMenuAnchor(null);
    const url = `${window.location.origin}/community?post=${encodeURIComponent(
      post.id
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setActionMessage("Post link copied.");
    } catch {
      setActionMessage("Could not copy the post link.");
    }
  };
  // T: O(p) and S: O(p), where p is the post identifier length

  const handleUnfollow = async () => {
    if (friendActionPending) return;
    setOwnerMenuAnchor(null);
    setFriendActionPending(true);
    setActionMessage("");
    try {
      await removeFriend(post.authorId);
      setFriendshipStatus("none");
      setActionMessage(`You are no longer following ${post.authorName}.`);
    } catch (caught) {
      setActionMessage(
        caught instanceof Error
          ? caught.message
          : `Could not unfollow ${post.authorName}`
      );
    } finally {
      setFriendActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleOpenEdit = () => {
    if (!editWindowOpen) return;
    setOwnerMenuAnchor(null);
    setEditBody(displayBody);
    setPostActionError("");
    setEditOpen(true);
  };
  // T: O(b) and S: O(b), where b is the post body length

  const handleEditPost = async () => {
    const body = editBody.trim();
    if (!body || postActionPending) return;
    setPostActionPending(true);
    setPostActionError("");
    try {
      const updated = await updatePost(post.id, body);
      const nextBody = updated.body ?? body;
      setDisplayBody(nextBody);
      onUpdated(post.id, nextBody);
      setEditOpen(false);
    } catch (caught) {
      setPostActionError(
        caught instanceof Error ? caught.message : "Could not edit post"
      );
    } finally {
      setPostActionPending(false);
    }
  };
  // T: O(b) and S: O(b), where b is the post body length

  const handleOpenDelete = () => {
    setOwnerMenuAnchor(null);
    setPostActionError("");
    setDeleteOpen(true);
  };
  // T: O(1) and S: O(1)

  const handleDeletePost = async () => {
    if (postActionPending) return;
    setPostActionPending(true);
    setPostActionError("");
    try {
      await deletePost(post.id);
      setDeleteOpen(false);
      onDeleted(post.id);
    } catch (caught) {
      setPostActionError(
        caught instanceof Error ? caught.message : "Could not delete post"
      );
    } finally {
      setPostActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
      }}
    >
      {/* Meta row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {communityName && (
          <Chip
            label={communityName}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.72rem",
              fontWeight: 700,
              bgcolor: C.accentFaint,
              color: C.accentDark,
            }}
          />
        )}
        <Typography
          sx={{ fontSize: "0.8rem", color: C.textSub, fontWeight: 600 }}
        >
          {post.category}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: C.textMuted }}>
          · {post.timeAgo}
        </Typography>
        <Chip
          label={post.type}
          size="small"
          sx={{
            ...typeChipStyle(post.type),
            fontSize: "0.72rem",
            height: 22,
            fontWeight: 600,
          }}
        />
      </Box>

      {post.tags.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1.5, flexWrap: "wrap", rowGap: 1 }}
        >
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                bgcolor: C.surface,
                color: C.textSub,
                border: `1px solid ${C.divider}`,
                fontSize: "0.72rem",
                height: 24,
              }}
            />
          ))}
        </Stack>
      )}

      {/* Author row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Avatar
            src={post.authorAvatar}
            sx={{
              width: 38,
              height: 38,
              bgcolor: C.accentFaint,
              color: C.accentDark,
              fontSize: "0.85rem",
            }}
          >
            {post.authorName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <Typography
                sx={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: C.textPrimary,
                }}
              >
                {post.authorName}
              </Typography>
              {post.verified && (
                <VerifiedRoundedIcon sx={{ fontSize: 15, color: C.accent }} />
              )}
            </Box>
            <Typography sx={{ fontSize: "0.78rem", color: C.textMuted }}>
              {post.authorProfession} · {post.timeAgo}
            </Typography>
          </Box>
        </Box>
        {friendshipStatus === "none" || friendshipStatus === "pending" ? (
          <Button
            size="small"
            onClick={handleAddFriend}
            disabled={friendActionPending || friendshipStatus !== "none"}
            startIcon={
              friendshipStatus === "none" ? <PersonAddAltRoundedIcon /> : null
            }
            sx={{
              color: C.accentDark,
              textTransform: "none",
              fontWeight: 700,
              "&.Mui-disabled": { color: C.textMuted },
            }}
          >
            {friendActionPending
              ? "Adding…"
              : friendshipStatus === "none"
              ? "Add as friend"
              : "Request sent"}
          </Button>
        ) : (
          <>
            <Tooltip title="Post options">
              <IconButton
                aria-label="Post options"
                aria-controls={
                  ownerMenuAnchor ? `post-menu-${post.id}` : undefined
                }
                aria-haspopup="menu"
                aria-expanded={ownerMenuAnchor ? "true" : undefined}
                onClick={(event) => setOwnerMenuAnchor(event.currentTarget)}
                sx={{ color: C.textSub }}
              >
                <MoreHorizRoundedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id={`post-menu-${post.id}`}
              anchorEl={ownerMenuAnchor}
              open={Boolean(ownerMenuAnchor)}
              onClose={() => setOwnerMenuAnchor(null)}
              MenuListProps={{ "aria-label": "Post options" }}
            >
              {friendshipStatus === "self" && (
                <MenuItem
                  disabled={!editWindowOpen}
                  onClick={handleOpenEdit}
                  sx={{ gap: 1 }}
                >
                  <EditOutlinedIcon fontSize="small" />
                  {editWindowOpen ? "Edit post" : "Edit window ended"}
                </MenuItem>
              )}
              {friendshipStatus === "self" && (
                <MenuItem
                  onClick={handleOpenDelete}
                  sx={{ gap: 1, color: C.red }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                  Delete post
                </MenuItem>
              )}
              {friendshipStatus === "accepted" && (
                <MenuItem onClick={handleMenuShare} sx={{ gap: 1 }}>
                  <ShareOutlinedIcon fontSize="small" />
                  Share this post
                </MenuItem>
              )}
              {friendshipStatus === "accepted" && (
                <MenuItem onClick={handleCopyPostLink} sx={{ gap: 1 }}>
                  <LinkRoundedIcon fontSize="small" />
                  Copy post link
                </MenuItem>
              )}
              {friendshipStatus === "accepted" && (
                <MenuItem
                  disabled={friendActionPending}
                  onClick={handleUnfollow}
                  sx={{ gap: 1, color: C.red }}
                >
                  <PersonRemoveOutlinedIcon fontSize="small" />
                  Unfollow {post.authorName}
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>

      {/* Title + body */}
      {post.title && (
        <Typography
          sx={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: C.textPrimary,
            mb: 1,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {post.title}
        </Typography>
      )}
      <Typography
        sx={{ fontSize: "0.9rem", color: C.textSub, lineHeight: 1.6, mb: 2.5 }}
      >
        {displayBody}
      </Typography>

      {post.media?.map((item) =>
        item.type === "image" ? (
          <Box
            key={item.id}
            component="img"
            src={item.url}
            alt="Community post upload"
            sx={{
              display: "block",
              width: "100%",
              maxHeight: 560,
              objectFit: "contain",
              borderRadius: 2,
              bgcolor: C.surface,
              mb: 2,
            }}
          />
        ) : (
          <Box
            key={item.id}
            component="video"
            src={item.url}
            controls
            sx={{
              display: "block",
              width: "100%",
              maxHeight: 560,
              borderRadius: 2,
              bgcolor: "#111",
              mb: 2,
            }}
          />
        )
      )}

      {poll && (
        <Stack spacing={1} sx={{ width: "100%", maxWidth: 480, mb: 2.5 }}>
          {poll.allowsMultiple && (
            <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>
              Select one or more options, then submit your vote.
            </Typography>
          )}
          {poll.options.map((option) => (
            <Button
              key={option.id}
              variant="outlined"
              disabled={pollClosed}
              onClick={() => handlePollOptionClick(option.id)}
              sx={{
                justifyContent: "space-between",
                borderColor: C.divider,
                color: C.textPrimary,
                bgcolor: "#fff",
                textTransform: "none",
                borderRadius: 2,
                py: 1,
                "&:hover": {
                  borderColor: C.divider,
                  bgcolor: "#fff",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {poll.allowsMultiple ? (
                  <Checkbox
                    checked={selectedPollOptionIds.includes(option.id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      p: 0,
                      color: C.textMuted,
                      pointerEvents: "none",
                      "&.Mui-checked": { color: C.accent },
                      "& .MuiSvgIcon-root": {
                        fontSize: 18,
                        transition: "color 180ms ease",
                      },
                    }}
                  />
                ) : (
                  <Radio
                    checked={selectedPollOptionIds.includes(option.id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      p: 0,
                      color: C.textMuted,
                      pointerEvents: "none",
                      "&.Mui-checked": { color: C.accent },
                      "& .MuiSvgIcon-root": {
                        fontSize: 18,
                        transition: "color 180ms ease",
                      },
                    }}
                  />
                )}
                <span>{option.text}</span>
              </Box>
              <Box
                component="span"
                sx={{ transition: "color 180ms ease", whiteSpace: "nowrap" }}
              >
                {option.voteCount} {option.voteCount === 1 ? "vote" : "votes"}
              </Box>
            </Button>
          ))}
          {poll.allowsMultiple && (
            <Button
              variant="contained"
              disabled={
                pollClosed ||
                (selectedPollOptionIds.length === 0 &&
                  poll.viewerOptionIds.length === 0) ||
                Boolean(votingOptionId)
              }
              onClick={handleMultiplePollVote}
              sx={{
                alignSelf: "flex-start",
                bgcolor: C.accent,
                color: "#fff",
                textTransform: "none",
                borderRadius: 5,
                boxShadow: "none",
                "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
              }}
            >
              {votingOptionId === "multiple" ? "Submitting…" : "Submit vote"}
            </Button>
          )}
          {pollError && (
            <Typography sx={{ color: C.red, fontSize: "0.76rem" }}>
              {pollError}
            </Typography>
          )}
        </Stack>
      )}

      <Divider sx={{ borderColor: C.divider, mb: 1.5 }} />

      {/* Footer stats */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            component="button"
            type="button"
            onClick={handleLike}
            disabled={likePending}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: liked ? C.accentDark : C.textMuted,
              border: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              font: "inherit",
              p: 0,
              "&:hover": { color: C.accentDark },
            }}
          >
            {liked ? (
              <FavoriteRoundedIcon sx={{ fontSize: 17 }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 17 }} />
            )}
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: C.textMuted,
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: "0.82rem" }}>{post.views}</Typography>
          </Box>
          <Box
            onClick={handleToggleComments}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: showComments ? C.accentDark : C.textMuted,
              cursor: "pointer",
              "&:hover": { color: C.accentDark },
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: showComments ? 600 : 400 }}
            >
              {Math.max(post.replyCount ?? 0, comments.length)}{" "}
              {Math.max(post.replyCount ?? 0, comments.length) === 1
                ? "comment"
                : "comments"}
            </Typography>
          </Box>
          <Tooltip title="Share with a friend">
            <IconButton
              aria-label="Share post"
              onClick={handleSharePost}
              size="small"
              sx={{ color: C.textMuted, "&:hover": { color: C.accentDark } }}
            >
              <ShareOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      {actionMessage && (
        <Typography sx={{ mt: 1, color: C.textMuted, fontSize: "0.75rem" }}>
          {actionMessage}
        </Typography>
      )}

      {/* Comments + reply box */}
      {showComments && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ borderColor: C.divider, mb: 1.5 }} />

          {comments.length === 0 ? (
            <Typography sx={{ fontSize: "0.85rem", color: C.textMuted, mb: 2 }}>
              No replies yet — be the first to help.
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}
                >
                  <Avatar
                    src={comment.authorAvatar}
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: C.accentFaint,
                      color: C.accentDark,
                      fontSize: "0.72rem",
                    }}
                  >
                    {comment.authorName.charAt(0)}
                  </Avatar>
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: C.surface,
                      border: `1px solid ${C.divider}`,
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 0.3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {comment.authorName}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.7rem", color: C.textMuted }}
                      >
                        {comment.timeAgo}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: C.textSub,
                        lineHeight: 1.5,
                      }}
                    >
                      {comment.body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}

          {/* Reply input */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: C.accentFaint,
                color: C.accentDark,
                fontSize: "0.72rem",
              }}
            >
              M
            </Avatar>
            <Box
              component="input"
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReplyText(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleReply();
              }}
              placeholder="Write a reply..."
              sx={{
                flex: 1,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: C.surface,
                border: `1px solid ${C.divider}`,
                fontSize: "0.85rem",
                color: C.textPrimary,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <Box
              onClick={handleReply}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.accentGrad,
                color: "#fff",
                flexShrink: 0,
                cursor: "pointer",
                opacity: replying ? 0.6 : 1,
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          {replyError && (
            <Typography sx={{ mt: 1, color: C.red, fontSize: "0.76rem" }}>
              {replyError}
            </Typography>
          )}
        </Box>
      )}

      <Dialog
        open={editOpen}
        onClose={() => !postActionPending && setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Edit post
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textMuted, fontSize: "0.78rem", mb: 1.5 }}>
            Posts can be edited for five minutes after publishing.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
            inputProps={{ maxLength: post.poll ? 150 : 10_000 }}
            error={Boolean(postActionError)}
            helperText={
              postActionError ||
              `${editBody.length}/${post.poll ? 150 : 10_000}`
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setEditOpen(false)}
            disabled={postActionPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditPost}
            disabled={!editBody.trim() || postActionPending}
            sx={{
              bgcolor: C.accent,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
            }}
          >
            {postActionPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => !postActionPending && setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Delete this post?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
            This removes the post and its conversation from the feed. This
            action cannot be undone.
          </Typography>
          {postActionError && (
            <Typography sx={{ color: C.red, fontSize: "0.78rem", mt: 1.5 }}>
              {postActionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={postActionPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePost}
            disabled={postActionPending}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            {postActionPending ? "Deleting…" : "Delete post"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
// T: O(c + m + o) and S: O(c + o), where c is comments, m is media, and o is poll options

export default PostCard;
