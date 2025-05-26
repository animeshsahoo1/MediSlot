import { Children, createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";


//step1: create context
export const AppContext=createContext();

//step3:make context provider i.e create and pass values, only created here passing is done below in value attribute 
export const AppContextProvider=({children})=>{
    const  navigate=useNavigate();
    const [user,setUser]=useState(null);
    const value={user,setUser,navigate};

    //step2:wrap everything u want to send in a context provider 
    return <AppContext.Provider value={value}>
        {children}{/* This will render whatever is inside <Parent> where parent is <ContextProvider> in main.jsx*/}
    </AppContext.Provider>
}

//step4: go to the component you want to use these variables in and use it
export const useAppContext=()=>{
    return useContext(AppContext)
}