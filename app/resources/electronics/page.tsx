"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import './style.css'
import Link from 'next/link';
import { usePathname } from "next/navigation";
const ETCPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNOTES, setIsOpenNOTES] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add("background");

    return () => {
      document.body.classList.remove("background");
    };
  }, [pathname]);
  return (
    <div className="background">
      <div className="sections">
        <div className="heading">Department of Electronics & Telecommunication</div>
        <div>
          <button className="pyq" onClick={() => setIsOpen(!isOpen)}>
            󱄶 Previous Year Questions {isOpen ? "󰄿" : "󰄼"}
          </button>
          <div className={`sems ${isOpen ? "open" : ""}`}>
            <p><Link href="/resources/electronics/etc_midsem_pyq/">Mid-Semester</Link></p>
            <p><Link href="/resources/electronics/etc_endsem_pyq/">End-Semester</Link></p>
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

export default ETCPage;