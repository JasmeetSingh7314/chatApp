import React, { useEffect, useState } from "react";

import ScrollToBottom from "react-scroll-to-bottom";
import { LuLeafyGreen } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { IoIosSend } from "react-icons/io";
import "react-chat-elements/dist/main.css";

function Chat({ socket, username, roomId, chatToggle }) {
  const [messages, setMessage] = useState([]);
  console.log(messages);

  const message = useForm({
    defaultValues: {
      currentMessage: "",
    },
  });

  const { register } = message;

  const sendMessage = async () => {
    const sentObject = {
      author: username,
      room: roomId,
      currentMessage: message.getValues("currentMessage"),
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes() +
        ":" +
        new Date(Date.now()).getSeconds(),
    };
    console.log(sentObject);
    await socket.emit("message", sentObject);
    message.setValue("currentMessage", "");
    setMessage((prev) => [...prev, sentObject]);
  };
  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessage((list) => [...list, data]);
      console.log(data);
    });
    return () => {
      socket.off("receive-message");
    };
  }, [socket]);
  return (
    <section className=" chat-window  mt-20">
      <section className="chat-header text-4xl font-semibold flex gap-5 items-center justify-center">
        Live Chat: {roomId} <LuLeafyGreen className="text-2xl font-semibold" />
      </section>
      <section className="chat-body rounded-xl">
        <ScrollToBottom className="message-container">
          {messages.map((element, index) => (
            <div
              key={index}
              className="message"
              id={username === element.author ? "you" : "other"}
            >
              <div>
                <div className="message-content flex justify-center rounded-lg px-12 py-4 ">
                  <p>{element.currentMessage}</p>
                </div>
                <div className="message-meta text-black">
                  <p id="author" className="mr-3">
                    {element.author}
                  </p>
                  <p id="time">{element.time}</p>
                </div>
              </div>
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
        onClick={() => chatToggle(false)}
      >
        Leave Room
      </button>
    </section>
  );
}

export default Chat;
