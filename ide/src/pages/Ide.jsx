import { Settings, Sun, Moon} from "lucide-react"
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { EditorLayout } from "../components/EditorLayout";
import {Dashboard} from "./Dashboard"


export const Ide = () => {
    return (
        <div className="w-full h-full flex-col bg-white text-white">
            {/* Header */}
            <header className="w-full h-[8%] flex flex-row pr-4 pl-4 justify-between items-center bg-zinc-900 border-b border-zinc-800">
                <div className="flex flex-row items-center gap-3 font-bold">
                    <span className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-lg">{'</>'}</span>
                    <h1 className="text-lg font-semibold">CipherStudio</h1>
                </div>
                <div className="flex justify-center align-center gap-2 pr-1">
                    <button className="p-2 hover:bg-zinc-800 rounded-xl cursor-pointer">
                        <Sun className="w-5 h-5 text-orange-500" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded-xl cursor-pointer">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="w-full h-[92%]">
                {/*<SandpackProvider template="react" theme="dark" style={{ height: '100%' }}>
                    <EditorLayout />
                </SandpackProvider>*/}
                <Dashboard/>
            </div>
        </div>
    )
}
