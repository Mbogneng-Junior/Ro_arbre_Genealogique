import {Home, Save, Users} from "lucide-react";
import type React from "react";

export default function ProgressIndicator({step} : {step:number} )
{
    return (
        <div className="bg-primary px-6 py-4">
            <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-white text-primary" : "bg-white/30 text-white"} mr-2`}
                    >
                        <Home size={18}/>
                    </div>
                    <span className="font-medium">Informations de la famille</span>
                </div>
                <div className="h-1 w-12 bg-white/30 mx-2"></div>
                <div className="flex items-center">
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-white text-primary" : "bg-white/30 text-white"} mr-2`}
                    >
                        <Users size={18}/>
                    </div>
                    <span className="font-medium">Membres de la famille</span>
                </div>
                <div className="h-1 w-12 bg-white/30 mx-2"></div>
                <div className="flex items-center">
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-white text-primary" : "bg-white/30 text-white"} mr-2`}
                    >
                        <Save size={18}/>
                    </div>
                    <span className="font-medium">Finalisation</span>
                </div>
            </div>
        </div>
    )
}