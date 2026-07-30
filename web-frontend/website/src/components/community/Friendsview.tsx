"use client";

import React, { useEffect, useState } from "react";
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
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  CommunityFriendRequest,
  CommunityPersonSearchResult,
  searchPeople,
} from "@/lib/community-api";
import { C } from "./constants";
import { Friend } from "./Types";
import FriendRow from "./Frienddrow";

const FriendsView = ({
  friends,
  friendRequests,
  onAddFriend,
  onResolveRequest,
}: {
  friends: Friend[];
  friendRequests: CommunityFriendRequest[];
  onAddFriend: (friendId: string) => Promise<void>;
  onResolveRequest: (
    requestId: string,
    status: "accepted" | "declined"
  ) => Promise<void>;
}) => {
  const [section, setSection] = useState<"friends" | "requests">("friends");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [requestActionId, setRequestActionId] = useState("");
  const [requestError, setRequestError] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const currentFriends = friends.filter((friend) => friend.isFriend);

  useEffect(() => {
    if (normalizedSearch.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    let cancelled = false;
    setSearchResults([]);
    setSearching(true);
    setSearchError("");
    const timer = window.setTimeout(() => {
      const runSearch = async () => {
        try {
          const results = await searchPeople(normalizedSearch);
          if (cancelled) return;
          const uniqueResults = [
            ...new Map(results.map((person) => [person.id, person])).values(),
          ];
          setSearchResults(
            uniqueResults.map((person: CommunityPersonSearchResult) => ({
              id: person.id,
              name: person.name,
              handle: person.handle,
              role: person.role,
              avatarUrl: person.avatarUrl,
              mutualFriends: 0,
              isFriend: person.friendshipStatus === "accepted",
              friendshipStatus: person.friendshipStatus,
            }))
          );
        } catch (caught) {
          if (!cancelled) {
            setSearchError(
              caught instanceof Error
                ? caught.message
                : "Could not search for people"
            );
          }
        } finally {
          if (!cancelled) setSearching(false);
        }
      };
      // T: O(r) and S: O(r), where r is the returned search results
      void runSearch();
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [normalizedSearch]);

  const handleSearchResultAdd = async (friendId: string) => {
    setSearchError("");
    try {
      await onAddFriend(friendId);
      setSearchResults((current) =>
        current.map((friend) =>
          friend.id === friendId
            ? { ...friend, friendshipStatus: "pending" }
            : friend
        )
      );
    } catch (caught) {
      setSearchError(
        caught instanceof Error
          ? caught.message
          : "Could not send friend request"
      );
    }
  };
  // T: O(r) and S: O(r), where r is the current search results

  const handleResolveRequest = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    if (requestActionId) return;
    setRequestActionId(requestId);
    setRequestError("");
    try {
      await onResolveRequest(requestId, status);
    } catch (caught) {
      setRequestError(
        caught instanceof Error
          ? caught.message
          : "Could not update friend request"
      );
    } finally {
      setRequestActionId("");
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
          Friends
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.9rem", mt: 0.5 }}>
          Find people by name and keep your learning circle close.
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: `1px solid ${C.divider}`,
          pb: normalizedSearch ? 1 : 0,
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search people by name, handle, or role"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: C.textMuted }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: searchResults.length > 0 ? 1.5 : 0,
            "& .MuiInput-root": {
              px: 0.5,
              py: 1,
              color: "#111",
              fontSize: "0.95rem",
              "&:before": { borderBottomColor: C.divider },
              "&:hover:not(.Mui-disabled, .Mui-error):before": {
                borderBottomColor: C.textPrimary,
              },
              "&:after": { borderBottomColor: C.accent },
            },
            "& input::placeholder": {
              color: C.textMuted,
              opacity: 1,
            },
          }}
        />

        {normalizedSearch && (
          <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
            {searchResults.map((friend) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                onAddFriend={handleSearchResultAdd}
              />
            ))}
            {searching && (
              <Box sx={{ display: "grid", placeItems: "center", py: 2.5 }}>
                <CircularProgress size={22} sx={{ color: C.accent }} />
              </Box>
            )}
            {!searching && searchError && (
              <Typography
                role="alert"
                sx={{ color: "#b3261e", textAlign: "center", py: 2.5 }}
              >
                {searchError}
              </Typography>
            )}
            {!searching &&
              !searchError &&
              normalizedSearch.length >= 2 &&
              searchResults.length === 0 && (
                <Typography
                  sx={{ color: C.textMuted, textAlign: "center", py: 3 }}
                >
                  No people match “{search}”.
                </Typography>
              )}
            {normalizedSearch.length === 1 && (
              <Typography
                sx={{ color: C.textMuted, textAlign: "center", py: 2.5 }}
              >
                Type at least two characters to search.
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      <Box>
        <Tabs
          value={section}
          onChange={(_, value: "friends" | "requests") => setSection(value)}
          variant="fullWidth"
          sx={{
            mb: 2,
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTab-root": {
              color: C.textSub,
              textTransform: "none",
              fontWeight: 700,
            },
            "& .Mui-selected": { color: `${C.textPrimary} !important` },
            "& .MuiTabs-indicator": { bgcolor: C.accent },
          }}
        >
          <Tab
            value="friends"
            label={`Your friends (${currentFriends.length})`}
          />
          <Tab
            value="requests"
            label={`Friend Requests (${friendRequests.length})`}
          />
        </Tabs>

        {section === "friends" ? (
          currentFriends.length === 0 ? (
            <Typography sx={{ color: C.textMuted, textAlign: "center", py: 4 }}>
              Your accepted friends will appear here.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {currentFriends.map((friend) => (
                <Card
                  key={friend.id}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${C.divider}`,
                    boxShadow: "0 4px 16px rgba(44,26,10,0.04)",
                  }}
                >
                  <FriendRow
                    friend={friend}
                    onAddFriend={onAddFriend}
                    compact
                  />
                </Card>
              ))}
            </Box>
          )
        ) : friendRequests.length === 0 ? (
          <Typography sx={{ color: C.textMuted, textAlign: "center", py: 4 }}>
            You have no pending friend requests.
          </Typography>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
            {friendRequests.map((request) => (
              <Box
                key={request.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                  py: 1.5,
                }}
              >
                <Avatar
                  src={request.avatarUrl ?? undefined}
                  alt={request.name}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: C.accentFaint,
                    color: C.accentDark,
                  }}
                >
                  {request.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: C.textPrimary, fontWeight: 700 }}>
                    {request.name}
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>
                    {request.handle} · {request.role}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    disabled={Boolean(requestActionId)}
                    onClick={() => handleResolveRequest(request.id, "accepted")}
                    sx={{
                      bgcolor: C.accent,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={Boolean(requestActionId)}
                    onClick={() => handleResolveRequest(request.id, "declined")}
                    sx={{
                      color: C.textSub,
                      borderColor: C.divider,
                      textTransform: "none",
                    }}
                  >
                    Decline
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
        {requestError && (
          <Typography
            role="alert"
            sx={{ color: C.red, textAlign: "center", mt: 2 }}
          >
            {requestError}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};
// T: O(f) and S: O(f), where f is the number of friends

export default FriendsView;
