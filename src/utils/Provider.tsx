"use client";
import constate from "constate";
import {useEffect, useMemo, useState} from "react";
import axios from "axios";





export const [FamilyTreeProvider, useAuthentication] = constate(useLogin, value => value.authMethods);



function useLogin() {

    const [isLogged, setIsLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState({});


    function saveAuthParameters(token: string) {
        localStorage.setItem("family_tree_token", token);
    }


    function clearLocalStorage()
    {
        localStorage.removeItem("family_tree_token");
    }





    async function getCurrentUserInfos  ()
    {
        const token = localStorage.getItem("token_key_fultang");
        if (token)
        {
            try
            {
                const response = await axios.get("http://localhost:8080/api/user", {headers: {"Authorization": `Bearer ${token}`}});
                if (response.status === 200)
                {
                    console.log(response.data);
                    setIsLogged(true);
                    setUserData(response.data);
                }
            }
            catch (error)
            {
                console.log(error);
                setIsLogged(false);
            }
        }

    }



    useEffect(() => {
        const token = localStorage.getItem("token_key_fultang");
        if (token)
        {
            setIsLogged(true);
            getCurrentUserInfos()
        }
        else
        {
            setIsLogged(false);
            setUserData({});
            clearLocalStorage();
        }
    }, []);



    function isAuthenticated()
    {
        return isLogged;
    }








    function logout()
    {
        clearLocalStorage();
        setIsLogged(false);
        setUserData({});
    }



    const authMethods = useMemo(() => ({
        setIsLoading,
        isLoading,
        userData,
        isLogged,
        isAuthenticated,
        logout,
    }), [isLoading, userData, isLogged, logout]);
    return {authMethods}
}