import * as SocketManager from "./socket_manager.js";
import { Socket } from "socket.io-client";
export declare class GearO {
    socket: Socket<SocketManager.ServerToClientEvents, SocketManager.ClientToServerEvents>;
    game: string;
    id: string;
    version: string;
    constructor();
    joinFree(): void;
    join1(): void;
    join10(): void;
    join50(): void;
    quitGame(): void;
    up(): void;
    down(): void;
    right(): void;
    left(): void;
    shoot(): void;
    onGameId(_game: string, _id: string): void;
    onWalletConnect(uri: string): void;
    onSendMap(map: string): void;
    onGameOver(): void;
    onNbOfUser(nb: number): void;
    onVersionErr(version: string): void;
    onMaintenance(): void;
    onMaxUsrReach(): void;
    onErr(err: string): void;
}
