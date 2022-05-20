import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { history } from "../redux/configureStore";
import {
  Flex,
  Text,
  Grid,
  Image,
  Wrap,
  ImageCarousel,
  Button,
} from "../elements";

import {
  deletePostDB,
  getPostOne,
  go2detail,
  otherPost,
  filteringData,
} from "../redux/modules/store";

import { getFollowDB } from "../redux/modules/follow";

import { addFollowDB } from "../redux/modules/follow";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { priceComma } from "../shared/utils";
import theme from "../styles/theme";
import SellLabel from "../components/SellLabel";
import { deleteSwal } from "../shared/commonAlert";

// 임시 아이콘
import { IoMdHeart } from "react-icons/io";

// 채팅
import { socket } from "../shared/socket";
import { makeChatRoom, receiveChatRoom } from "../redux/modules/chat";
import { postMarkupToggle } from "../redux/modules/user";
import { Heart } from "../assets/icons";
import { FollowCheck, StoreMore } from "../components";

const StoreDetail = () => {
  const dispatch = useDispatch();
  const { postId } = useParams();

  const detailData = useSelector((state) => state.store.detailData);
  const currentUser = useSelector((state) => state.user?.user);
  const otherPosts = useSelector((state) => state.store.otherPost);
  const myFollowList = useSelector((state) => state.followUser.myFollowing);
  const { roomList } = useSelector((state) => state.chat);

  // userId만 받던거에서 다 받는걸로 수정
  const followInfo = detailData?.user;

  useEffect(() => {
    // reset
    dispatch(go2detail([]));
    dispatch(otherPost([]));
    dispatch(filteringData("전체"));
    // getdata
    dispatch(getPostOne(postId));

    if (currentUser) {
      dispatch(getFollowDB());
    }
  }, [postId]);

  const isMe = detailData?.user?.userId === currentUser?.userId;

  const [nowFollowing, setNowFollowing] = useState(false);

  useEffect(() => {
    const result =
      myFollowList?.find((u) => u.followId === detailData?.user?.userId) ||
      false;
    if (result) {
      setNowFollowing(true);
    }
  }, [detailData]);

  const deletePosting = async () => {
    const result = await deleteSwal();
    console.log(result);
    if (result) {
      dispatch(deletePostDB(postId));
    }
  };

  // 팔로우
  const clickFollowbtn = () => {
    const userData = {
      followId: followInfo.userId,
      followName: followInfo.nickname,
      profileImage: followInfo.profileImage,
    };

    console.log(userData);

    dispatch(addFollowDB(userData));
    setNowFollowing(!nowFollowing);
  };

  // 찜하기
  const markupToggle = () => {
    if (currentUser && !isMe) {
      dispatch(postMarkupToggle(postId));
    }
  };

  // 더보기
  const moveToProfile = (userId) => {
    if (userId === currentUser.userId) {
      history.push(`/mypage`);
    }
    history.push(`/userprofile/${userId}`);
  };

  // 채팅하기 버튼 눌렀을때
  const startChat = () => {
    const postUser = detailData.user?.userId;
    const nowUser = currentUser?.userId;

    let roomName = `from${nowUser}_to${postUser}_${postId}`;

    const isExistRoom = roomList.find((room) => room.roomName === roomName);

    if (isExistRoom) {
      console.log("isExistRoom!!!!!!!");
      history.push(`/chat/${roomName}`);
      return;
    }

    const chatPostData = {
      postId,
      imageUrl: detailData.imageUrl[0],
      postTitle: detailData.postTitle,
      price: detailData.price,
      done: detailData.done,
    };

    const targetUser = {
      userId: detailData.user.userId,
      nickname: detailData.user.nickname,
      profileImage: detailData.user.profileImage,
      connected: null,
    };

    socket.emit("join_room", roomName, postUser, chatPostData);
    dispatch(
      makeChatRoom({
        roomName,
        post: chatPostData,
        targetUser,
        newMessage: 0,
        lastMessage: null,
        lastTime: null,
      })
    );

    history.push(`/chat/${roomName}`);
  };

  return (
    <>
      {detailData && (
        <>
          <Wrap margin="0 16px">
            <Flex>
              <Text h1 medium>
                {detailData.postTitle}
              </Text>
              <SellLabel complete3 />
            </Flex>
            <Flex margin="10px 0 6px" jc="space-between">
              {/* 5.18 cursor:pointer를 위한 style-components 추가 */}
              <ProfileBtn
                onClick={() => {
                  history.push(`/userprofile/${detailData.user.userId}`);
                }}
              >
                <Flex>
                  <Image
                    circle
                    size="32"
                    src={detailData?.user?.profileImage}
                  />
                  <Text margin="0 0 0 8px">{detailData?.user?.nickname}</Text>
                </Flex>
              </ProfileBtn>
              <Flex>
                {isMe ? (
                  <>
                    <Flex
                      padding="6px"
                      onClick={() => {
                        console.log("수정");
                        history.push(`/store/write/${postId}`);
                      }}
                    >
                      <Text body1 color={theme.pallete.primary900}>
                        수정하기
                      </Text>
                    </Flex>
                    <Flex padding="6px 0 6px 6px" onClick={deletePosting}>
                      <Text body1 color={theme.pallete.primary900}>
                        삭제하기
                      </Text>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex padding="6px" onClick={clickFollowbtn}>
                      <FollowCheck text follow={nowFollowing} />
                    </Flex>
                    <Flex
                      padding="0"
                      margin="0 0 0 6px"
                      onClick={() => {
                        console.log("신고하기");
                      }}
                    >
                      <Text body1 color={theme.pallete.primary900}>
                        신고
                      </Text>
                    </Flex>
                  </>
                )}
              </Flex>
            </Flex>
          </Wrap>
          <ImageCarousel src={detailData.images} />

          <Wrap margin="16px 16px 64px">
            <Flex margin="8px 0" jc="space-between">
              <Text color={theme.pallete.gray3}>분류</Text>
              <Text color={theme.pallete.gray3}>{detailData.category}</Text>
            </Flex>

            <Flex margin="8px 0 10px" jc="space-between">
              <Text color={theme.pallete.gray3}>거래 방식</Text>
              <Text color={theme.pallete.gray3}>
                {detailData.transaction}
                {detailData.changeAddress && ` ∙ ${detailData.changeAddress}`}
              </Text>
            </Flex>
            <Flex>
              <Text color="black" margin="0 0 16px">
                {detailData.postContent}
              </Text>
            </Flex>
            {otherPosts && (
              <>
                <Flex margin="4px 0 10px">
                  <Text h2 lineHeight="22px">
                    작가의 다른 작품
                  </Text>

                  {isMe ? (
                    <>
                      <Text lineHeight="22px">
                        <Button
                          fontSize="16px"
                          color={`${theme.color.brandColor}`}
                          text
                          onClick={() =>
                            moveToProfile(otherPosts[0].user.userId)
                          }
                        >
                          더보기
                        </Button>
                      </Text>
                    </>
                  ) : (
                    <>
                      <Wrap margin="0 0 0 4px" fg="1"></Wrap>
                      <Text lineHeight="22px">
                        <Button
                          fontSize="16px"
                          color={`${theme.color.brandColor}`}
                          text
                          padding="0"
                          onClick={() =>
                            moveToProfile(otherPosts[0].user.userId)
                          }
                        >
                          더보기
                        </Button>
                      </Text>
                    </>
                  )}
                </Flex>
                <Grid gtc="1fr 1fr" rg="18px" cg="8px" margin="0 0 20px">
                  {otherPosts.map((post) => {
                    return <StoreMore key={post.postId} {...post} />;
                  })}
                </Grid>
              </>
            )}
          </Wrap>

          <FixedChatBar>
            <Flex onClick={markupToggle}>
              {currentUser &&
              currentUser?.myMarkup?.find((id) => id === postId) ? (
                <IoMdHeart size={24} color={theme.pallete.primary850} />
              ) : (
                <Heart />
              )}

              <Text h3 medium margin="0 0 0 4px" color={theme.pallete.gray3}>
                {detailData.markupCnt}
              </Text>
              <Text h3 medium margin="0 20px">
                {detailData.price && priceComma(detailData.price)}원
              </Text>
            </Flex>
            <Flex jc="end">
              {isMe ? (
                <Button padding="8px 16px">
                  <Text color="white">판매완료로 변경</Text>
                </Button>
              ) : (
                <Button padding="12px 16px" onClick={startChat}>
                  채팅하기
                </Button>
              )}
            </Flex>
          </FixedChatBar>
        </>
      )}
    </>
  );
};

const FixedChatBar = styled.div`
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8px 16px;
  border-top: 1px solid ${theme.pallete.gray1};
  max-width: ${theme.view.maxWidth};
  height: 56px;
`;
const ProfileBtn = styled.div`
  cursor: pointer;
`;
export default StoreDetail;
