import React, { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChatCard, NoInfo } from "../components";
import { Grid } from "../elements";
import { history } from "../redux/configureStore";
import {
  getChatList,
  getChatMessages,
  getNowChatInfo,
  receiveChat,
  receiveChatRoom,
} from "../redux/modules/chat";
import Loader from "../shared/Loader";
import { socket } from "../shared/socket";
import theme from "../styles/theme";

const Chat = () => {
  const dispatch = useDispatch();
  const { chatData } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getChatList());

    socket.on("join_room", (data) => {
      console.log("join_room socketOn:  ", data);
      dispatch(receiveChatRoom(data));
      socket.emit("enter_room", data.roomName);
    });

    socket.on("receive_message", (data) => {
      dispatch(receiveChat(data));
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const enterRoom = async (roomName) => {
    dispatch(getNowChatInfo(roomName));
    await dispatch(getChatMessages(roomName));
  };

  return (
    <>
      <Suspense fallback={Loader}>
        <Grid border={`1px solid ${theme.pallete.gray1}`}>
          <NoInfo
            list={chatData?.chatRoom}
            text1="아직 대화중인 사람이 없어요!"
          >
            {chatData?.chatRoom?.map((room, i) => {
              return (
                <ChatCard
                  key={room.roomName}
                  room={room}
                  onClick={() => enterRoom(room.roomName)}
                />
              );
            })}
          </NoInfo>
        </Grid>
      </Suspense>
    </>
  );
};

export default Chat;
