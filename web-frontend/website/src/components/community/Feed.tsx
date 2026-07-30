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
} from "@mui/material";
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
  cancelFriendRequest,
} from "@/lib/community-api";

import {
  Community,
  CreateCommunityFormInput,
  ForumPost,
  Friend,
  ScheduledMeeting,
} from "./Types";
import { ALL_ID, C, SAMPLE_MEETINGS } from "./constants";
import { delay, mapCommunity, mapPost } from "./utils";
import PostCard from "./Postcard";
import CommunitiesView from "./Communitiesview";
import Composer from "./composer";
import FriendsView from "./Friendsview";
import ScheduleMeetings from "./Schedulemeetings";

import CommunityRail from "./Communityrail";
import FriendsRail from "./Friendsrail";

// The page has three "views": the default two-column feed (posts + sidebar),
// and two full-width managers (Communities, Friends) reached from the
// sidebar instead of a top tab bar.
type MainView = "feed" | "communities" | "friends";

type Props = {
  meetings?: ScheduledMeeting[];
};

const CommunityFeed = ({ meetings = SAMPLE_MEETINGS }: Props) => {
  const [mainView, setMainView] = useState<MainView>("feed");
  const [activeCommunityId, setActiveCommunityId] = useState<string>(ALL_ID);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<
    CommunityFriendRequest[]
  >([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const inviteHandled = useRef(false);
  const activePostScopeRef = useRef<string>(ALL_ID);
  const feedRequestRef = useRef(0);

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
      await refreshPosts(nextCommunityId);
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

  // Selecting a community from the sidebar switches the feed to it directly
  // (replacing the old tab -> "open community" flow).
  const handleSelectCommunity = async (communityId: string) => {
    const requestId = feedRequestRef.current + 1;
    feedRequestRef.current = requestId;
    setFeedLoading(true);
    setActiveCommunityId(communityId);
    setMainView("feed");
    setPageError("");
    try {
      await refreshPosts(communityId);
    } catch (caught) {
      if (feedRequestRef.current === requestId) {
        setPageError(
          caught instanceof Error ? caught.message : "Could not load this feed"
        );
      }
    } finally {
      if (feedRequestRef.current === requestId) {
        setFeedLoading(false);
      }
    }
  };
  // T: O(p) and S: O(p), where p is the returned posts

  const handleOpenCommunitiesManager = () => {
    setMainView("communities");
    setPageError("");
  };
  // T: O(1) and S: O(1)

  const handleOpenFriendsManager = () => {
    setMainView("friends");
    setPageError("");
  };
  // T: O(1) and S: O(1)

  const handleBackToFeed = () => {
    setMainView("feed");
    setPageError("");
    void refreshCommunities();
  };
  // T: O(c) and S: O(c), where c is returned communities

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

  const handleCancelFriendRequest = async (userId: string): Promise<void> => {
    await cancelFriendRequest(userId);
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

  const isAllView = activeCommunityId === ALL_ID;
  const activeCommunity = communities.find(
    (community) => community.id === activeCommunityId
  );
  const communityNameById = new Map(communities.map((c) => [c.id, c.name]));
  const pendingFriendRequests = friendRequests.length;

  const pageHeading =
    mainView === "communities"
      ? "Communities"
      : mainView === "friends"
      ? "Friends"
      : isAllView
      ? "All Communities"
      : activeCommunity?.name ?? "Community";

  return (
    <Box
      sx={{
        bgcolor: C.surface,
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
        "& .MuiInputLabel-root.Mui-focused": { color: C.accentDark },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: C.accent,
            borderWidth: 2,
          },
        "& .MuiRadio-root.Mui-checked": { color: C.accent },
      }}
    >
      <Box
        sx={{
          mx: { xs: -2, md: -4 },
          mt: { xs: -2, md: -4 },
          px: { xs: 2, md: 4 },
          // pt: { xs: 2, md: 4 },
          pb: 2,
          borderBottom: `1px solid ${C.divider}`,
          boxShadow: "0 4px 20px rgba(44,26,10,0.05)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: C.textMuted,
              mb: 0.3,
              fontWeight: 600,
            }}
          >
            Viewing
          </Typography>
          <Typography
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: C.textPrimary,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {pageHeading}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
        {pageError && (
          <Alert
            severity="error"
            sx={{ borderRadius: 2, mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={loadCommunityPage}>
                Retry
              </Button>
            }
          >
            {pageError}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: C.accent }} />
          </Box>
        )}

        {!loading && mainView === "communities" && (
          <Stack spacing={2}>
            <Button
              onClick={handleBackToFeed}
              sx={{
                alignSelf: "flex-start",
                color: C.accentDark,
                textTransform: "none",
                fontWeight: 600,
                px: 0,
              }}
            >
              ← Back to feed
            </Button>
            <CommunitiesView
              communities={communities}
              friends={friends}
              meetings={meetings}
              onJoin={handleJoinCommunity}
              onCreate={handleCreateCommunity}
              onOpen={handleSelectCommunity}
            />
          </Stack>
        )}

        {!loading && mainView === "friends" && (
          <Stack spacing={2}>
            <Button
              onClick={handleBackToFeed}
              sx={{
                alignSelf: "flex-start",
                color: C.accentDark,
                textTransform: "none",
                fontWeight: 600,
                px: 0,
              }}
            >
              ← Back to feed
            </Button>
            <FriendsView
              friends={friends}
              friendRequests={friendRequests}
              onAddFriend={handleAddFriend}
              onResolveRequest={handleResolveFriendRequest}
              onCancelRequest={handleCancelFriendRequest}
            />
          </Stack>
        )}

        {!loading && mainView === "feed" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2.4fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Feed column */}
            <Stack spacing={3}>
              {pendingFriendRequests > 0 && (
                <Card
                  onClick={handleOpenFriendsManager}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: C.cardBg,
                    border: `1px solid ${C.accentBorder}`,
                    borderLeft: `4px solid ${C.accent}`,
                    boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
                    cursor: "pointer",
                    "&:hover": { background: C.accentHover },
                  }}
                >
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
                      : "pending friend requests"}{" "}
                    — review in Friends
                  </Typography>
                </Card>
              )}

              {/* <Typography sx={{ color: C.textSub, fontSize: "0.84rem" }}>
                Share what you&apos;re learning, building, or curious about. Ask
                a question or join the conversation.
              </Typography> */}

              <Composer
                scope={isAllView ? "global" : "community"}
                communityId={isAllView ? undefined : activeCommunityId}
                onCreated={handlePostCreated}
              />

              {feedLoading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                  <CircularProgress size={28} sx={{ color: C.accent }} />
                </Box>
              ) : posts.length === 0 ? (
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
                    {isAllView
                      ? "No member posts yet — be the first to share something."
                      : "No messages yet — start this community's conversation."}
                  </Typography>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    communityName={
                      isAllView && post.communityId
                        ? communityNameById.get(post.communityId)
                        : undefined
                    }
                    onUpdated={handlePostUpdated}
                    onDeleted={handlePostDeleted}
                  />
                ))
              )}
            </Stack>

            {/* Sidebar column */}
            <Stack spacing={3}>
              <ScheduleMeetings
                meetings={meetings}
                activeCommunityId={activeCommunityId}
                activeCommunityName={activeCommunity?.name}
              />
              <CommunityRail
                communities={communities}
                activeCommunityId={activeCommunityId}
                onSelect={handleSelectCommunity}
                onJoin={handleJoinCommunity}
                onManage={handleOpenCommunitiesManager}
              />
              <FriendsRail
                friends={friends}
                friendRequests={friendRequests}
                onManage={handleOpenFriendsManager}
              />
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};
// T: O(c + p + f) and S: O(c + f), where c is communities, p is posts, and f is friends

export default CommunityFeed;
