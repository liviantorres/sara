import React from "react";
import Menu from "../components/Sidebar";
import Layout from "../components/Layout";
import Card from "../components/Card";
import {TriangleAlert, Users, GraduationCap} from "lucide-react";
import Chart from "../components/Chart";

export default function Analysis(){

    return(
        <div>
            <h1 className="font-lexend font-light text-4xl pl-5 pt-5">Análises</h1>
            <p className="font-lexend font-extralight pl-6 pb-8">Gerenciar e visualizar dados dos estudantes</p>

        </div>
    );
}