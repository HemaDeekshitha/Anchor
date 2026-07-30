"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  CommunityRecord,
  CommunityFriendRequest,
  acceptCommunityInvite,
  createCommunity,
  createInviteLink,
  createPost,
  joinCommunity,
  listCommunities,
  listCommunityFeed,
  listFriendRequests,
  listFriends,
  listGlobalPosts,
  sendFriendRequest,
  resolveFriendRequest,
  CommunityPostRecord,
} from "@/lib/community-api";

import {
  Community,
  CommunityPageTab,
  CreateCommunityFormInput,
  ForumPost,
  Friend,
  ScheduledMeeting,
} from "./Types";
import { ALL_ID, C, SAMPLE_MEETINGS } from "./constants";
import { delay, mapCommunity, mapPost } from "./utils";
import CommunityNavigation from "./Communitynavigation";
import PostCard from "./Postcard";
import CommunitiesView from "./Communitiesview";
import Composer from "./composer";
import FriendsView from "./Friendsview";

type Props = {
  meetings?: ScheduledMeeting[];
};

const CommunityFeed = ({ meetings = SAMPLE_MEETINGS }: Props) => {
  const [pageTab, setPageTab] = useState<CommunityPageTab>("posts");
  const [activeCommunityId, setActiveCommunityId] = useState<string>(ALL_ID);
  const [communityConversationId, setCommunityConversationId] = useState<
    string | null
  >(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<
    CommunityFriendRequest[]
  >([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const inviteHandled = useRef(false);
  const activePostScopeRef = useRef<string>(ALL_ID);
  const conversationRequestRef = useRef(0);

  const refreshPosts = useCallback(async (communityId: string) => {
    activePostScopeRef.current = communityId;
    const records =
      communityId === ALL_ID
        ? await listGlobalPosts()
        : await listCommunityFeed(communityId);
    const mapped = records.map(mapPost);
    if (activePostScopeRef.current === communityId) {
      setPosts(mapped);
    }
    return mapped;
  }, []);
  // T: O(p) and S: O(p), where p is returned posts

  const refreshCommunities = useCallback(async () => {
    const [joinedRecords, discoverRecords] = await Promise.all([
      listCommunities("joined"),
      listCommunities("discover"),
    ]);
    const joinedIds = new Set(joinedRecords.map((community) => community.id));
    const combined = new Map<string, CommunityRecord>();
    for (const community of [...joinedRecords, ...discoverRecords]) {
      combined.set(community.id, community);
    }
    const mapped = [...combined.values()].map((community) =>
      mapCommunity(community, joinedIds.has(community.id))
    );
    setCommunities(mapped);
    return mapped;
  }, []);
  // T: O(c) and S: O(c), where c is returned communities

  const refreshFriendWorkspace = useCallback(async () => {
    const [friendRecords, requestRecords] = await Promise.all([
      listFriends(),
      listFriendRequests(),
    ]);
    setFriends(
      friendRecords.map((friend) => ({
        id: friend.id,
        name: friend.name,
        handle: friend.email,
        role: "Anchor member",
        mutualFriends: 0,
        isFriend: true,
      }))
    );
    setFriendRequests(requestRecords);
    return { friendRecords, requestRecords };
  }, []);
  // T: O(f + r) and S: O(f + r), where f is friends and r is requests

  const loadCommunityPage = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      let inviteError = "";
      const inviteToken = new URLSearchParams(window.location.search).get(
        "invite"
      );
      if (inviteToken && !inviteHandled.current) {
        inviteHandled.current = true;
        try {
          await acceptCommunityInvite(inviteToken);
          window.history.replaceState({}, "", window.location.pathname);
          setPageTab("communities");
        } catch (caught) {
          inviteError =
            caught instanceof Error
              ? caught.message
              : "Could not accept community invitation";
        }
      }
      const saved =
        window.localStorage.getItem("anchor:activeCommunityId") ?? ALL_ID;
      const [mappedCommunities] = await Promise.all([
        refreshCommunities(),
        refreshFriendWorkspace(),
      ]);
      const validSaved =
        saved === ALL_ID ||
        mappedCommunities.some(
          (community) => community.id === saved && community.joined
        );
      const nextCommunityId = validSaved ? saved : ALL_ID;
      setActiveCommunityId(nextCommunityId);
      await refreshPosts(ALL_ID);
      setHydrated(true);
      if (inviteError) setPageError(inviteError);
    } catch (caught) {
      setPageError(
        caught instanceof Error
          ? caught.message
          : "Could not load the Community page"
      );
    } finally {
      setLoading(false);
    }
  }, [refreshCommunities, refreshFriendWorkspace, refreshPosts]);
  // T: O(c + f + p) and S: O(c + f + p), where c is communities, f is friends, and p is posts

  useEffect(() => {
    void loadCommunityPage();
  }, [loadCommunityPage]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("anchor:activeCommunityId", activeCommunityId);
  }, [activeCommunityId, hydrated]);

  const handleJoinCommunity = async (communityId: string) => {
    await joinCommunity(communityId);
    await refreshCommunities();
  };
  // T: O(c) and S: O(c), where c is returned communities

  const handleCreateCommunity = async (
    input: CreateCommunityFormInput
  ): Promise<{ community: Community; inviteLink: string | null }> => {
    const record = await createCommunity({
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      friendIds: input.friendIds,
    });
    if (input.firstPost) {
      await createPost({
        communityId: record.id,
        body: input.firstPost,
        mode: "text",
      });
    }
    const inviteLink = input.createShareLink
      ? await createInviteLink(record.id)
      : null;
    const community = mapCommunity(record, true);
    await refreshCommunities();
    return { community, inviteLink };
  };
  // T: O(f + p) and S: O(f + p), where f is invited friends and p is first-post length

  const handleOpenCommunity = async (communityId: string) => {
    const requestId = conversationRequestRef.current + 1;
    conversationRequestRef.current = requestId;
    setConversationLoading(true);
    setPosts([]);
    setActiveCommunityId(communityId);
    setCommunityConversationId(communityId);
    setPageTab("communities");
    setPageError("");
    try {
      await refreshPosts(communityId);
    } catch (caught) {
      if (conversationRequestRef.current === requestId) {
        setPageError(
          caught instanceof Error ? caught.message : "Could not open community"
        );
      }
    } finally {
      if (conversationRequestRef.current === requestId) {
        setConversationLoading(false);
      }
    }
  };
  // T: O(p) and S: O(p), where p is the returned community posts

  const handlePageTabChange = (nextTab: CommunityPageTab) => {
    setPageTab(nextTab);
    setPageError("");
    setConversationLoading(false);
    conversationRequestRef.current += 1;
    if (nextTab === "posts") {
      setCommunityConversationId(null);
      void refreshPosts(ALL_ID).catch((caught) => {
        setPageError(
          caught instanceof Error ? caught.message : "Could not load posts"
        );
      });
    }
    if (nextTab === "communities") {
      activePostScopeRef.current = "community-list";
      setCommunityConversationId(null);
    }
  };
  // T: O(1) and S: O(1)

  const handleCloseCommunityConversation = () => {
    conversationRequestRef.current += 1;
    activePostScopeRef.current = "community-list";
    setConversationLoading(false);
    setCommunityConversationId(null);
    void refreshCommunities();
  };
  // T: O(1) and S: O(1)

  const handlePostCreated = async (
    post: CommunityPostRecord
  ): Promise<void> => {
    try {
      const target = post.communityId ?? ALL_ID;

      if (post.status === "published") {
        const optimisticPost: ForumPost = {
          ...mapPost(post),
          friendshipStatus: "self",
        };
        if (activePostScopeRef.current === target) {
          setPosts((current) =>
            current.some((item) => item.id === optimisticPost.id)
              ? current
              : [optimisticPost, ...current]
          );
        }
        await refreshPosts(target);
        return;
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await delay(1_500);
        const refreshed = await refreshPosts(target);
        if (refreshed.some((item) => item.id === post.id)) return;
      }
      setPageError(
        "Your media was uploaded and is still processing. It will appear after processing finishes."
      );
    } catch (caught) {
      setPageError(
        caught instanceof Error
          ? caught.message
          : "Your post was created, but the feed could not be refreshed."
      );
    }
  };
  // T: O(p) and S: O(p), where p is returned posts and retries are bounded

  const handlePostUpdated = (postId: string, body: string): void => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, body } : post))
    );
  };
  // T: O(p) and S: O(p), where p is the number of displayed posts

  const handlePostDeleted = (postId: string): void => {
    setPosts((current) => current.filter((post) => post.id !== postId));
  };
  // T: O(p) and S: O(p), where p is the number of displayed posts

  const handleAddFriend = async (friendId: string): Promise<void> => {
    await sendFriendRequest(friendId);
  };
  // T: O(1) network request and S: O(1)

  const handleResolveFriendRequest = async (
    requestId: string,
    status: "accepted" | "declined"
  ): Promise<void> => {
    await resolveFriendRequest(requestId, status);
    await refreshFriendWorkspace();
  };
  // T: O(f + r) and S: O(f + r), where f is friends and r is requests

  const conversationCommunity = communities.find(
    (community) => community.id === communityConversationId
  );
  const visiblePosts = posts;
  const pendingFriendRequests = friendRequests.length;

  const pageHeading =
    pageTab === "posts"
      ? "All Communities"
      : pageTab === "communities"
      ? communityConversationId
        ? conversationCommunity?.name ?? "Community"
        : "Communities"
      : "Friends";

  return (
    <Box
      sx={{
        bgcolor: C.surface,
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
        "& .MuiInputLabel-root.Mui-focused": {
          color: C.accentDark,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: C.accent,
            borderWidth: 2,
          },
        "& .MuiRadio-root.Mui-checked": {
          color: C.accent,
        },
        pb:
          pageTab === "posts" || Boolean(communityConversationId)
            ? { xs: "120px", sm: "116px", md: "120px" }
            : { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          bgcolor: C.cardBg,
          mx: { xs: -2, md: -4 },
          mt: { xs: -2, md: -4 },
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 4 },
          pb: 2,
          borderBottom: `1px solid ${C.divider}`,
          boxShadow: "0 4px 20px rgba(44,26,10,0.05)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
          <Typography sx={{ fontSize: "0.78rem", color: C.textMuted, mb: 0.3 }}>
            Viewing
          </Typography>
          <Typography
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: C.textPrimary,
              fontFamily: "'Playfair Display', serif",
              mb: 2,
            }}
          >
            {pageHeading}
          </Typography>
          <CommunityNavigation value={pageTab} onChange={handlePageTabChange} />
        </Box>
      </Box>

      <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
        {pageError && (
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadCommunityPage}>
                Retry
              </Button>
            }
          >
            {pageError}
          </Alert>
        )}

        {!loading && pendingFriendRequests > 0 && pageTab !== "friends" && (
          <Card
            onClick={() => handlePageTabChange("friends")}
            sx={{
              p: 2,
              borderRadius: 3,
              background: C.cardBg,
              border: `1px solid ${C.accentBorder}`,
              borderLeft: `4px solid ${C.accent}`,
              boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              maxWidth: 860,
              width: "100%",
              mx: "auto",
              "&:hover": { background: C.accentHover },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: C.accentFaint,
                  color: C.accentDark,
                  flexShrink: 0,
                }}
              >
                <GroupsRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: C.textPrimary,
                  }}
                >
                  {pendingFriendRequests}{" "}
                  {pendingFriendRequests === 1
                    ? "pending friend request"
                    : "pending friend requests"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: C.textMuted }}>
                  Review and respond in Friends
                </Typography>
              </Box>
            </Box>
            <Chip
              label="View"
              size="small"
              icon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: C.accentFaint,
                color: C.accentDark,
                fontWeight: 700,
                fontSize: "0.72rem",
              }}
            />
          </Card>
        )}

        {loading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: C.accent }} />
          </Box>
        )}

        {!loading && pageTab === "posts" && (
          <Box
            sx={{
              width: "100%",
              maxWidth: 860,
              mx: "auto",
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ color: C.textSub, fontSize: "0.84rem" }}>
                  Share what you&apos;re learning, building, or curious about.
                  Ask a question or join the conversation.
                </Typography>
              </Box>

              {visiblePosts.length === 0 ? (
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${C.divider}`,
                    textAlign: "center",
                    background: C.cardBg,
                    boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
                  }}
                >
                  <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
                    No member posts yet — be the first to share something.
                  </Typography>
                </Card>
              ) : (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdated={handlePostUpdated}
                    onDeleted={handlePostDeleted}
                  />
                ))
              )}
            </Stack>
          </Box>
        )}

        {!loading &&
          pageTab === "communities" &&
          communityConversationId &&
          conversationCommunity && (
            <Box sx={{ width: "100%", maxWidth: 860, mx: "auto" }}>
              <Stack spacing={3}>
                <Box>
                  <Button
                    onClick={handleCloseCommunityConversation}
                    sx={{
                      color: C.accentDark,
                      textTransform: "none",
                      px: 0,
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    ← Back to communities
                  </Button>
                  <Typography
                    sx={{
                      color: C.textPrimary,
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.45rem",
                      fontWeight: 700,
                    }}
                  >
                    {conversationCommunity.name}
                  </Typography>
                  <Typography sx={{ color: C.textSub, fontSize: "0.84rem" }}>
                    Conversation shared only with this community&apos;s members.
                  </Typography>
                </Box>
                {conversationLoading ? (
                  <Box
                    sx={{
                      minHeight: 180,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <CircularProgress size={28} sx={{ color: C.accent }} />
                  </Box>
                ) : visiblePosts.length === 0 ? (
                  <Card
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: `1px solid ${C.divider}`,
                      textAlign: "center",
                      background: C.cardBg,
                      boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
                    }}
                  >
                    <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
                      No messages yet — start this community&apos;s
                      conversation.
                    </Typography>
                  </Card>
                ) : (
                  visiblePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      communityName={conversationCommunity.name}
                      onUpdated={handlePostUpdated}
                      onDeleted={handlePostDeleted}
                    />
                  ))
                )}
              </Stack>
            </Box>
          )}

        {!loading &&
          (pageTab === "posts" ||
            (pageTab === "communities" &&
              Boolean(communityConversationId))) && (
            <Box
              sx={{
                position: "fixed",
                left: { xs: 0, md: "var(--anchor-sidebar-width, 84px)" },
                right: 0,
                bottom: { xs: 14, md: 18 },
                zIndex: 1100,
                px: { xs: 2, sm: 3, md: 4, lg: 5 },
                py: { xs: 0.5, md: 0.55 },
                bgcolor: "transparent",
                borderTop: "none",
                boxShadow: "none",
                pointerEvents: "none",
                transition: "left 220ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 860,
                  mx: "auto",
                  pointerEvents: "auto",
                }}
              >
                <Composer
                  scope={pageTab === "posts" ? "global" : "community"}
                  communityId={communityConversationId ?? undefined}
                  onCreated={handlePostCreated}
                />
              </Box>
            </Box>
          )}

        {!loading && pageTab === "communities" && !communityConversationId && (
          <CommunitiesView
            communities={communities}
            friends={friends}
            meetings={meetings}
            onJoin={handleJoinCommunity}
            onCreate={handleCreateCommunity}
            onOpen={handleOpenCommunity}
          />
        )}

        {!loading && pageTab === "friends" && (
          <FriendsView
            friends={friends}
            friendRequests={friendRequests}
            onAddFriend={handleAddFriend}
            onResolveRequest={handleResolveFriendRequest}
          />
        )}
      </Stack>
    </Box>
  );
};
// T: O(c + p + f) and S: O(c + f), where c is communities, p is posts, and f is friends

export default CommunityFeed;
