"use client";
import React, { useState } from "react";
import '../style.css';
import Link from 'next/link';
export default function Page() {
    const [isOpenFirstYear, setIsOpenFirstYear] = useState(false);
    const [isOpenSecondYear, setIsOpenSecondYear] = useState(false);
    const [isOpenThirdYear, setIsOpenThirdYear] = useState(false);
    const [isOpenFourthYear, setIsOpenFourthYear] = useState(false);
    return (
        <div className="background">
            <div className="sections">
                <div className="heading">Mid-Semester Questions</div>

                {/* First Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenFirstYear(!isOpenFirstYear)}>
                         First Year {isOpenFirstYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenFirstYear ? "open" : ""}`}>
                        <p><Link href="/resources/electrical/ee_midsem_pyq/">1st Semester</Link></p>
                        <p><Link href="/resources/electrical/ee_midsem_pyq/"><Link href="https://drive.google.com/drive/u/2/folders/1Ms7oVGunQYwpDwQ9JDs99NBw3fQdoHZH">2nd Semester</Link></Link></p>

                    </div>
                </div>

                {/* Second Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenSecondYear(!isOpenSecondYear)}>
                         Second Year {isOpenSecondYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenSecondYear ? "open" : ""}`}>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">3rd Semester</Link></p>
                        <p><Link href="https://drive.google.com/drive/u/2/folders/1vVyKtfTUQoWfLR9NHQQ4faEZVJvHtjR4">4th Semester</Link></p>
                    </div>
                </div>

                {/* Third Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenThirdYear(!isOpenThirdYear)}>
                         Third Year {isOpenThirdYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenThirdYear ? "open" : ""}`}>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">5th Semester</Link></p>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">6th Semester</Link></p>
                    </div>
                </div>

                {/* Fourth Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenFourthYear(!isOpenFourthYear)}>
                         Fourth Year {isOpenFourthYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenFourthYear ? "open" : ""}`}>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">7th Semester</Link></p>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">8th Semester</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
