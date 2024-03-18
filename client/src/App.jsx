import io from "socket.io-client";

import { Form, useForm } from "react-hook-form";
import Chat from "./components/Chat";

import "./App.css";
import { useState } from "react";

const socket = io.connect("http://localhost:3001");
function App() {
  const [toggleChat, setToggleChat] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      RoomNo: "",
    },
  });
  console.log();

  const { register } = form;

  console.log(form);

  const emitJoin = () => {
    setToggleChat(true);
    const data = {
      name: form.getValues("name"),
      room: form.getValues("RoomNo"),
    };
    socket.emit("join-room", data);
  };

  return (
    <main>
      <span className="font-bold text-8xl text-red-400">Socket-io test</span>

      {toggleChat ? (
        <Chat
          socket={socket}
          username={form.watch("name")}
          roomId={form.watch("RoomNo")}
          chatToggle={setToggleChat}
        />
      ) : (
        <form className="flex flex-col mt-28 space-y-10">
          <label className="text-left text-3xl font-semibold tracking-tight">
            Name
          </label>
          <input
            type="text"
            className="p-4 rounded-md"
            placeholder="John Doe"
            {...register("name")}
          />
          <label className="text-left text-3xl font-semibold tracking-tight">
            Room Id
          </label>
          <input
            type="number"
            className="p-4 rounded-md"
            placeholder="123..."
            {...register("RoomNo")}
          />
          <button
            type="button"
            onClick={() => emitJoin()}
            className="p-6 tracking-tight font-semibold text-2xl bg-[#fff]/60 rounded-lg text-black"
          >
            Enter Room
          </button>
        </form>
      )}
    </main>
  );
}

export default App;
