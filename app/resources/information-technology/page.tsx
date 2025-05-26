"use client";
import React, { useState } from "react";
import "./style.css";
import Link from "next/link";

const ITPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNOTES, setIsOpenNOTES] = useState(false);
  const [modalType, setModalType] = useState<"mid" | "end" | null>(null);

  const closeModal = () => setModalType(null);

  return (
    <div className="background">
      <div className="sections">
        <div className="heading">
          Department of Information Technology
        </div>

        {/* PYQ Section */}
        <div>
          <button className="pyq" onClick={() => setIsOpen(!isOpen)}>
            󱄶 Previous Year Questions {isOpen ? "󰄿" : "󰄼"}
          </button>
          <div className={`flex flex-col justify-start items-start sems ${isOpen ? "open" : ""}`}>
            <button onClick={() => setModalType("mid")}>Mid-Semester</button>
            <button onClick={() => setModalType("end")}>End-Semester</button>
          </div>
        </div>

        {/* Modal */}
        {modalType && (
          <div className={`model ${modalType=="mid"?"bg-[#64de4caf]":"bg-[#dfa9a9a4]"} rounded-lg px-2 py-4 relative left-[20%] top-[-20%] w-[300px] h-auto`}>
            <div className="model-content">
              <button className="close" onClick={closeModal}>X</button>
              <h2 className="flex flex-col justify-center items-center">
                {Array.from({ length: 8 }, (_, i) => (
                  <Link
                    key={i}
                    href={`/academics/it?sem=${i + 1}&ex=${modalType}`}
                  >
                    {i + 1} Sem
                  </Link>
                ))}
              </h2>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <button className="notes" onClick={() => setIsOpenNOTES(!isOpenNOTES)}>
          <span className="note-icon"></span> Notes & Materials {isOpenNOTES ? "󰄿" : "󰄼"}
        </button>
        <div className={`year ${isOpenNOTES ? "open" : ""}`}>
          {Array.from({ length: 8 }, (_, i) => (
            <p key={i}>{i + 1} sem</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ITPage;
