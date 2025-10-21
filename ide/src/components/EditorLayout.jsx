import { Plus, PanelLeftClose, Download, Copy, PanelLeft, Play } from "lucide-react";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    useSandpack,
    FileTabs
} from "@codesandbox/sandpack-react";
import { FileTree } from "./FileTree"
import {ModalDialog} from "./ModalDialog"

export const EditorLayout = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isModalDialogOpen, setIsModalDialogOpen] = useState(false);
    const { dispatch} = useSandpack();


    return (
        <div className="w-full h-full flex">
        {isModalDialogOpen && <ModalDialog 
            setIsModalDialogOpen={setIsModalDialogOpen}/>}
            {/* File Explorer */}
        {isPanelOpen && <div className="flex-col h-full w-[15%]">
            <div className="w-full h-[5%] flex items-center justify-between bg-zinc-900 border-b border-zinc-800 pl-4 pr-1">
                    <span className="text-xs text-semibold text-gray-400">EXPLORER</span>
                    <div> 
                        <button className="p-1 hover:bg-zinc-800 rounded cursor-pointer"
                            onClick = {() => {setIsPanelOpen(false)}}
                            title = "Show Explorer"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button>   
                        <button className="p-1 hover:bg-zinc-800 rounded cursor-pointer"
                            onClick = {() => setIsModalDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="h-[95%] bg-zinc-950">
                   <FileTree/> 
                </div>
            </div>}

            {/* Editor and Preview */}
            <div className={`${isPanelOpen ? 'w-[85%]' : 'w-full'} h-full bg-black`}>
                <SandpackLayout style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
                    <PanelGroup direction="horizontal" style={{ width: '100%', height: '100%' }}>
                        <Panel defaultSize={50} minSize={20}>
                            <div className="flex flex-col h-full">
                                <FileTabs closableTabs={true}/>
                                <div className="bg-zinc-900 w-full h-[5%] border-b border-zinc-800 flex items-center justify-between pr-4 pl-4 gap-2">
                                    <div className="flex items-center gap-2">
                                        {!isPanelOpen && <button className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
                                            onClick = {() => setIsPanelOpen(true)}
                                            title = "Show Explorer"
                                        >
                                            <PanelLeft className="w-4 h-4" />
                                        </button>}
                                        <button className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
                                            title = "Copy Code"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
                                            title = "Download Code"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                   
                                </div>
                                <div style={{ flex: 1 }}>
                                    <SandpackCodeEditor
                                        showTabs={false}
                                        showLineNumbers={true}
                                        wrapContent
                                        showRunButton={true}
                                        style={{ height: '100%' }}
                                    />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="w-1 bg-zinc-700 hover:bg-orange-500 transition cursor-col-resize" />

                        <Panel defaultSize={50} minSize={20}>
                            <SandpackPreview style={{ height: '100%'}} />
                        </Panel>
                    </PanelGroup>
                </SandpackLayout>
            </div>
        </div>
    );
};
