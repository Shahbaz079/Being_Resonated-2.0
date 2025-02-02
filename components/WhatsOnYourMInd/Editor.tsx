import Placeholder from '@tiptap/extension-placeholder'
import { Editor, EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'
import { FaBold, FaStrikethrough, FaLaptopCode } from "react-icons/fa";
import { FaItalic } from "react-icons/fa6";
import { IoIosUndo } from "react-icons/io";
import "./editor.css"

const MenuBar = ({ active }: { active: boolean }) => {
    const { editor } = useCurrentEditor()

    if (!editor || !active) {
        return null
    }

    return (
        <div className="control-group bg-slate-950 rounded-xl animate-slide-top" onMouseDown={(e) => e.preventDefault()}>
            <div className="button-group flex gap-3 justify-center w-fit p-5 mx-auto">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    className={editor.isActive('bold') ? 'is-active' : ''}
                >
                    <FaBold></FaBold>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    }
                    className={editor.isActive('italic') ? 'is-active' : ''}
                >
                    <FaItalic></FaItalic>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                    className={editor.isActive('strike') ? 'is-active' : ''}
                >
                    <FaStrikethrough></FaStrikethrough>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                >
                    <FaLaptopCode></FaLaptopCode>
                </button>
                <button className='cursor-pointer'
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .undo()
                            .run()
                    }
                >
                    <IoIosUndo></IoIosUndo>
                </button>
            </div>
        </div>
    )
}

const extensions = [
    StarterKit.configure(),
    Placeholder.configure({
        placeholder: "What's on your mind ?"
    })
]

const EditorBox = ({ content, setCaption }: { content: string, setCaption: React.Dispatch<React.SetStateAction<string>> }) => {
    const [active, setActive] = useState<boolean>(false);

    return (
        <EditorProvider slotBefore={<MenuBar active={active} />} extensions={extensions} content={content} onUpdate={({ editor }) => {
            setCaption(editor.getHTML());
        }} editorProps={{
            attributes: {
                class: "disabled:opacity-50 min-h-20 disabled:cursor-not-allowed placeholder:opacity-80 text-cyan-300 rounded-xl py-3 px-4 w-full bg-transparent border-2 border-cyan-600"
            },
            handleDOMEvents: {
                focus: () => setActive(true),
                blur: () => setActive(false),
            }
        }} ></ EditorProvider>
    )
}

export default EditorBox;
