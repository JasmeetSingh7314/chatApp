import React, { useEffect, useState } from "react";

import ScrollToBottom from "react-scroll-to-bottom";
import { LuLeafyGreen } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { IoIosSend } from "react-icons/io";
import "react-chat-elements/dist/main.css";

function Chat({ socket, username, roomId, chatToggle }) {
  const [messages, setMessage] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [NumberofUsers, setNumberOfUsers] = useState(0);

  console.log(messages);

  const message = useForm({
    defaultValues: {
      currentMessage: "",
    },
  });

  const { register } = message;

  const sendMessage = async () => {
    if (message.getValues("currentMessage") !== "") {
      const sentObject = {
        author: username,
        room: roomId,
        currentMessage: message.getValues("currentMessage"),
        time: new Intl.DateTimeFormat("default", {
          hour: "numeric",
          minute: "numeric",
        }).format(new Date()),
      };
      console.log(sentObject);
      await socket.emit("message", sentObject);

      message.setValue("currentMessage", "");
      setMessage((prev) => [...prev, sentObject]);
    }
  };

  useEffect(() => {
    socket.on("message", (data) => {
      setMessage((adminmsg) => [...adminmsg, data]);
      socket.emit("users", { room: roomId });
      console.log(data);
    });
    socket.on("receive-message", (data) => {
      setMessage((list) => [...list, data]);
      console.log(data);
    });

    socket.on("usersList", (data) => {
      setUsersList(data.users);
      setNumberOfUsers(data.number);
    });

    return () => {
      socket.off("message");
      socket.off("receive-message");
      socket.off("usersList");
    };
  }, [socket]);
  console.log(usersList);

  console.log("The number of people are", usersList.length);

  function disconnectUser() {
    chatToggle(false);
    window.location.reload();
  }
  return (
    <section className=" chat-window  mt-20">
      <section className="chat-header text-4xl font-semibold flex flex-col  items-center justify-center">
        <span className="flex items-center font-urbanist">
          Live Chat:<span className="text-red-400 ml-5"> {roomId} </span>
          <LuLeafyGreen className="text-2xl font-semibold ml-5 text-green-600" />
        </span>
        <span className="text-lg">Active Members : {NumberofUsers}</span>
      </section>
      <section className="chat-body rounded-xl">
        <ScrollToBottom className="message-container font-urbanist">
          {messages.map((element, index) => (
            <div>
              {element.author === "ADMIN" ? (
                <span className="text-black text-xl font-semibold tracking-tighter font-urbanist">
                  {" "}
                  {element.message}
                </span>
              ) : (
                <div
                  key={index}
                  className="message"
                  id={username === element.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content flex justify-center rounded-lg px-12 py-4 ">
                      <p className="text-xl font-semibold">
                        {element.currentMessage}
                      </p>
                    </div>
                    <div className="message-meta text-black">
                      <p
                        id="author"
                        className="mr-3 text-xs font-semibold tracking-tighter"
                      >
                        {element.author}
                      </p>
                      <p id="time" className="tracking-lighter">
                        {element.time}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </ScrollToBottom>
      </section>
      <section className="chat-footer flex justify-around mt-8 ">
        <input
          type="text"
          placeholder="Type your Message ..."
          className="p-4 rounded-md"
          {...register("currentMessage")}
        />
        <button
          type="button"
          className=" bg-[#fff]/50 rounded-xl text-black text-2xl"
          onClick={() => sendMessage()}
        >
          <IoIosSend />
        </button>
      </section>
      <button
        type="button"
        className=" bg-[#fff]/50 rounded-xl text-black text-2xl p-3 mt-12"
        onClick={() => disconnectUser()}
      >
        Leave Room
      </button>
    </section>
  );
}

export default Chat;
