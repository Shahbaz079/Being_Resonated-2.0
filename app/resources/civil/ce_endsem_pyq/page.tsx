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
                <div className="heading">End-Semester Questions</div>

                {/* First Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenFirstYear(!isOpenFirstYear)}>
                         First Year {isOpenFirstYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenFirstYear ? "open" : ""}`}>
                        <p><Link href="/resources/mechanical/me_midsem_pyq/">1st Semester</Link></p>
                        <p><Link href="/resources/mechanical/me_midsem_pyq/">2nd Semester</Link></p>
                    </div>
                </div>

                {/* Second Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenSecondYear(!isOpenSecondYear)}>
                         Second Year {isOpenSecondYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenSecondYear ? "open" : ""}`}>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">3rd Semester</Link></p>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">4th Semester</Link></p>
                    </div>
                </div>

                {/* Third Year */}
                <div>
                    <button className="title_year" onClick={() => setIsOpenThirdYear(!isOpenThirdYear)}>
                         Third Year {isOpenThirdYear ? "󰄿" : "󰄼"}
                    </button>
                    <div className={`sems ${isOpenThirdYear ? "open" : ""}`}>
                        <p><Link href="/resources/information-technology/it_midsem_pyq/">5th Semester</Link></p>
                        <p><Link href="https://drive.google.com/drive/u/2/folders/1Q2n_ItqHBwQwaYKRdvh9bVL5BLXJMjJT">6th Semester</Link></p>
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
