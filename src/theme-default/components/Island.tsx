import { PropsWithIsland } from "shared/types";

interface IslandProps extends PropsWithIsland{
    children: React.ReactNode
}

export function Island(props:IslandProps){
    return (
        <div>
            {props.children}
        </div>
    )
}