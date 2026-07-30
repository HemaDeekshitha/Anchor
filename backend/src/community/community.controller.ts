import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CommunityService } from './community.service';
import {
  AcceptInviteDto,
  CreateCommentDto,
  CreateCommunityDto,
  CreateInviteDto,
  CreatePostDto,
  ListQueryDto,
  MediaSignatureDto,
  ResolveFriendRequestDto,
  SearchPeopleQueryDto,
  SendFriendRequestDto,
  UpdatePostDto,
  VotePollDto,
  VotePostDto,
} from './dto/community.dto';
import {
  DistributedRateLimit,
  DistributedRateLimitGuard,
} from './infrastructure/distributed-rate-limit.guard';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, DistributedRateLimitGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}
  // T: O(1) and S: O(1)

  private userId(request: Request): string {
    return request.user!.userId;
  }
  // T: O(1) and S: O(1)

  @Post('communities')
  @DistributedRateLimit(10, 60)
  createCommunity(@Req() request: Request, @Body() dto: CreateCommunityDto) {
    return this.communityService.createCommunity(this.userId(request), dto);
  }
  // T: O(f log F) and S: O(f), where f is invited friends

  @Get('communities')
  @DistributedRateLimit(120, 60)
  listCommunities(@Req() request: Request, @Query() query: ListQueryDto) {
    return this.communityService.listCommunities(
      this.userId(request),
      query.scope === 'discover' ? 'discover' : 'joined',
      query,
    );
  }
  // T: O(l log C) and S: O(l), where l is page size

  @Get('communities/:communityId')
  @DistributedRateLimit(120, 60)
  getCommunity(
    @Req() request: Request,
    @Param('communityId') communityId: string,
  ) {
    return this.communityService.getCommunity(
      this.userId(request),
      communityId,
    );
  }
  // T: O(log C + log M) and S: O(1)

  @Post('communities/:communityId/join')
  @DistributedRateLimit(20, 60)
  joinCommunity(
    @Req() request: Request,
    @Param('communityId') communityId: string,
  ) {
    return this.communityService.joinCommunity(
      this.userId(request),
      communityId,
    );
  }
  // T: O(log C + log M) and S: O(1)

  @Post('communities/:communityId/invites')
  @DistributedRateLimit(20, 60)
  createInvite(
    @Req() request: Request,
    @Param('communityId') communityId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.communityService.createInvite(
      this.userId(request),
      communityId,
      dto,
    );
  }
  // T: O(log M) and S: O(1)

  @Post('community-invites/accept')
  @DistributedRateLimit(10, 60)
  acceptInvite(@Req() request: Request, @Body() dto: AcceptInviteDto) {
    return this.communityService.acceptInvite(this.userId(request), dto);
  }
  // T: O(log I + log M) and S: O(1)

  @Post('community-invites/:inviteId/accept')
  @DistributedRateLimit(10, 60)
  acceptDirectInvite(
    @Req() request: Request,
    @Param('inviteId') inviteId: string,
  ) {
    return this.communityService.acceptDirectInvite(
      this.userId(request),
      inviteId,
    );
  }
  // T: O(log I + log M) and S: O(1)

  @Get('community-feed')
  @DistributedRateLimit(120, 60)
  listFeed(@Req() request: Request, @Query() query: ListQueryDto) {
    return this.communityService.listFeed(this.userId(request), query);
  }
  // T: O(l + m + o) and S: O(l + m + o), where l is posts, m is media, and o is poll options

  @Post('posts')
  @DistributedRateLimit(30, 60)
  createGlobalPost(@Req() request: Request, @Body() dto: CreatePostDto) {
    return this.communityService.createGlobalPost(this.userId(request), dto);
  }
  // T: O(m + o) and S: O(m + o), where m is media and o is poll options

  @Get('posts')
  @DistributedRateLimit(120, 60)
  listGlobalPosts(@Req() request: Request, @Query() query: ListQueryDto) {
    return this.communityService.listGlobalPosts(this.userId(request), query);
  }
  // T: O(l + m + o) and S: O(l + m + o), where l is posts, m is media, and o is poll options

  @Post('communities/:communityId/posts')
  @DistributedRateLimit(30, 60)
  createPost(
    @Req() request: Request,
    @Param('communityId') communityId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.communityService.createPost(
      this.userId(request),
      communityId,
      dto,
    );
  }
  // T: O(m + o) and S: O(m + o), where m is media and o is poll options

  @Get('communities/:communityId/posts')
  @DistributedRateLimit(120, 60)
  listPosts(
    @Req() request: Request,
    @Param('communityId') communityId: string,
    @Query() query: ListQueryDto,
  ) {
    return this.communityService.listPosts(
      this.userId(request),
      communityId,
      query,
    );
  }
  // T: O(l + m) and S: O(l + m), where l is posts and m is media

  @Patch('posts/:postId')
  @DistributedRateLimit(30, 60)
  updatePost(
    @Req() request: Request,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.communityService.updatePost(this.userId(request), postId, dto);
  }
  // T: O(log P) and S: O(1), where P is the number of posts

  @Delete('posts/:postId')
  @DistributedRateLimit(30, 60)
  deletePost(@Req() request: Request, @Param('postId') postId: string) {
    return this.communityService.deletePost(this.userId(request), postId);
  }
  // T: O(log P) and S: O(1), where P is the number of posts

  @Post('posts/:postId/vote')
  @DistributedRateLimit(120, 60)
  votePost(
    @Req() request: Request,
    @Param('postId') postId: string,
    @Body() dto: VotePostDto,
  ) {
    return this.communityService.votePost(this.userId(request), postId, dto);
  }
  // T: O(log V) and S: O(1)

  @Post('posts/:postId/comments')
  @DistributedRateLimit(60, 60)
  createComment(
    @Req() request: Request,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.createComment(
      this.userId(request),
      postId,
      dto,
    );
  }
  // T: O(log C) and S: O(1)

  @Get('posts/:postId/comments')
  @DistributedRateLimit(120, 60)
  listComments(
    @Req() request: Request,
    @Param('postId') postId: string,
    @Query() query: ListQueryDto,
  ) {
    return this.communityService.listComments(
      this.userId(request),
      postId,
      query,
    );
  }
  // T: O(l) and S: O(l), where l is the page size

  @Post('polls/:pollId/vote')
  @DistributedRateLimit(60, 60)
  votePoll(
    @Req() request: Request,
    @Param('pollId') pollId: string,
    @Body() dto: VotePollDto,
  ) {
    return this.communityService.votePoll(this.userId(request), pollId, dto);
  }
  // T: O(o + log P) and S: O(o)

  @Post('community-media/upload-signature')
  @DistributedRateLimit(30, 60)
  createMediaSignature(
    @Req() request: Request,
    @Body() dto: MediaSignatureDto,
  ) {
    return this.communityService.createMediaSignature(
      this.userId(request),
      dto.resourceType,
    );
  }
  // T: O(1) and S: O(1)

  @Get('friends')
  @DistributedRateLimit(120, 60)
  listFriends(@Req() request: Request, @Query('search') search?: string) {
    return this.communityService.listFriends(this.userId(request), search);
  }
  // T: O(l log F) and S: O(l)

  @Get('friends/search')
  @DistributedRateLimit(60, 60)
  searchPeople(@Req() request: Request, @Query() query: SearchPeopleQueryDto) {
    return this.communityService.searchPeople(
      this.userId(request),
      query.search,
      query.limit,
    );
  }
  // T: O(l log U) and S: O(l), where l is the result limit and U is users

  @Get('friends/requests')
  @DistributedRateLimit(120, 60)
  listFriendRequests(@Req() request: Request) {
    return this.communityService.listFriendRequests(this.userId(request));
  }
  // T: O(l log F) and S: O(l), where l is the result limit and F is friendships

  @Post('friends/requests')
  @DistributedRateLimit(20, 60)
  sendFriendRequest(
    @Req() request: Request,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.communityService.sendFriendRequest(this.userId(request), dto);
  }
  // T: O(log F) and S: O(1)

  @Patch('friends/requests/:requestId')
  @DistributedRateLimit(30, 60)
  resolveFriendRequest(
    @Req() request: Request,
    @Param('requestId') requestId: string,
    @Body() dto: ResolveFriendRequestDto,
  ) {
    return this.communityService.resolveFriendRequest(
      this.userId(request),
      requestId,
      dto,
    );
  }
  // T: O(log F) and S: O(1)

  @Delete('friends/requests/by-user/:userId')
  @DistributedRateLimit(20, 60)
  cancelFriendRequest(
    @Req() request: Request,
    @Param('userId') userId: string,
  ) {
    return this.communityService.cancelFriendRequest(
      this.userId(request),
      userId,
    );
  }
  // T: O(log F) and S: O(1), where F is friendships

  @Delete('friends/:friendId')
  @DistributedRateLimit(20, 60)
  removeFriend(@Req() request: Request, @Param('friendId') friendId: string) {
    return this.communityService.removeFriend(this.userId(request), friendId);
  }
  // T: O(log F) and S: O(1)
}
