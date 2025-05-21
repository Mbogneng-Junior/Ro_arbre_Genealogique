"use client";
import constate from "constate";
import {useEffect, useMemo, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {LoginFormType, UserType} from "@/lib/type";





export const [FamilyTreeProvider, useAuthentication] = constate(useLogin, value => value.authMethods);



function useLogin() {

    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserType|null>(null);


    function saveAuthParameters(token: string, username:string) {
        localStorage.setItem("family_tree_token", token);
        localStorage.setItem("username", username)
    }


    function clearLocalStorage()
    {
        localStorage.removeItem("family_tree_token");
        localStorage.removeItem("username");
    }


    async function login (data: LoginFormType): Promise<number|undefined>
    {
        setIsLoading(true);
        try
        {
            const response: AxiosResponse = await axios.post("http://localhost:8019/api/login", data);
            if (response.status === 200)
            {
                setIsLoading(false);
                console.log("logged user data: ",response);
                saveAuthParameters(response.data.data.BearerInfos.Bearer, response?.data.data.username);
                setUserData(response.data.user);
                await getCurrentUserInfos();
                return response.status;
            }
        }
        catch (error)
        {
            setIsLoading(false);
            console.error("Authentication error:", error);
            const axiosError = error as AxiosResponse;
            return axiosError.status;
        }
    }






    async function getCurrentUserInfos  ()
    {
        const token = localStorage.getItem("family_tree_token");
        if (token)
        {
            const username = localStorage.getItem("username") as string;
            if(username === null || username === undefined || username=="")
            {
                throw new Error("Username not found in local storage");
            }
            const data = {
                username: username
            }
            try
            {
                const response = await axios.post("http://localhost:8019/api/getUserInfo",data, {headers: {"Authorization": `Bearer ${token}`}});
                if (response.status === 200)
                {
                    console.log(response?.data);
                    setIsLogged(true);
                    setUserData(response?.data?.data);
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
        const token = localStorage.getItem("family_tree_token");
        if (token)
        {
            setIsLogged(true);
            getCurrentUserInfos()
        }
        else
        {
            setIsLogged(false);
            setUserData(null);
            clearLocalStorage();
        }
    }, []);





    function logout()
    {
        localStorage.clear();
       // clearLocalStorage();
        setIsLogged(false);
        setUserData(null);
        window.location.href="/";
    }



    const authMethods = useMemo(() => ({
        setIsLoading,
        isLoading,
        userData,
        isLogged,
        login,
        logout,
    }), [isLoading, userData, isLogged]);
    return {authMethods}
}