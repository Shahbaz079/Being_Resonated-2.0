"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import './style.css'
import Link from 'next/link';
import { usePathname } from "next/navigation";
const EEPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNOTES, setIsOpenNOTES] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      if (!localStorage.getItem("reload")) {
        localStorage.setItem("reload", "true");
        window.location.reload();
      } else {
        localStorage.removeItem("reload");
      }
    }
  }, []);
  return (
    <div className="background">
      <div className="sections">
        <div className="heading">Department of Mechanical Engineering</div>
        <div>
          <button className="pyq" onClick={() => setIsOpen(!isOpen)}>
            󱄶 Previous Year Questions {isOpen ? "󰄿" : "󰄼"}
          </button>
          <div className={`sems ${isOpen ? "open" : ""}`}>
            <p><Link href="/resources/mechanical/me_midsem_pyq/">Mid-Semester</Link></p>
            <p><Link href="/resources/mechanical/me_endsem_pyq/">End-Semester</Link></p>

          </div>
        </div>
        <button className="notes" onClick={() => setIsOpenNOTES(!isOpenNOTES)}><span className="note-icon"></span> Notes & Materials {isOpenNOTES ? "󰄿" : "󰄼"}</button>
        <div className={`year ${isOpenNOTES ? "open" : ""}`}>
          <p>1st Year</p>
          <p>2nd Year</p>
          <p>3rd Year</p>
          <p>4th Year</p>

        </div>
      </div>
    </div>
  );
};

export default EEPage;