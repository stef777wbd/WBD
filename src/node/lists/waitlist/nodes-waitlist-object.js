import NodesList from 'node/lists/nodes-list'
import NodesType from "node/lists/types/Nodes-Type"

class NodesWaitlistObject {

    constructor( sckAddresses, type, nodeConnected, level, backedBy){

        this.sckAddresses = sckAddresses;
        this.socket = null;

        this.nodeConnected = nodeConnected || false;
        this.blocked = false;
        this.checked = false;

        if (backedBy === undefined) backedBy = [];
        if ( !Array.isArray(backedBy) ) backedBy = [backedBy];
        this.backedBy = backedBy;

        this.connecting = false;

        this.errorTrial = 0;
        this.lastTimeChecked = 0;

        this.level = level||0;

        if (type === undefined) type = NodesType.NODE_TERMINAL;

        this.type = type;
    }

    refreshLastTimeChecked(){
        this.lastTimeChecked = new Date().getTime();
    }

    checkLastTimeChecked(timeTryReconnectAgain){

        let time = new Date().getTime();

        if ( (time - this.lastTimeChecked) >= timeTryReconnectAgain + this.errorTrial*5000 )
            return true;

        return false;
    }

    socketConnected(socket){

        this.errorTrial = 0;
        this.socket = socket;

    }

    socketErrorConnected(){
        this.errorTrial++;
    }

    checkIsConnected() {

        //checking if I had been connected in the past

        for (let i = 0; i < this.sckAddresses.length; i++) {
            let socket = NodesList.searchNodeSocketByAddress(this.sckAddresses[i], 'all', ["ip","uuid"]);
            if (socket !== null)
                return socket;
        }

        return null;
    }

    toString(){

        let text = "";
        for (let i=0; i<this.sckAddresses.length; i++)
            text += this.sckAddresses[i].toString()+ "   ";

        return text;

    }


    resetWaitlistNode(){

        this.lastTimeChecked = 0;
        this.errorTrial = 0;

    }


    toJSON(){

        return {

            type: this.type,
            addr: this.sckAddresses[0].toString(),
            port: this.sckAddresses[0].port,

        }

    }

    pushBackedBy(socket){

        if(!this.checkBackedByIfAlreadyExist(socket)) return false;
            else this.backedBy.push(socket);

    }

    checkBackedByIfAlreadyExist(socket){

        for (let i=0; i< this.backedBy.length; i++)
            if (this.backedBy[i] !== 'fallback')
                if (this.backedBy[i].json.node.sckAddress.matchAddress(socket.node.sckAddress))
                    return false;

        return true;

    }

    removeBackedBy(socket){

        for (let i=0; i< this.backedBy.length; i++)
            if (this.backedBy[i] === socket) {
                this.backedBy.splice(i, 1);
                return;
            }

    }

    findBackedBy(socket){

        for (let i=0; i<this.backedBy.length; i++)
            if (this.backedBy[i] === socket)
                return true;

        return null;
    }

}

export default NodesWaitlistObject;