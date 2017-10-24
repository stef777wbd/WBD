import {NodeClient} from '../../socket/node-client.js';
import {nodeProtocol, nodeFallBackInterval} from '../../../../../consts/const_global.js';
import {NodeClientsService} from '../node-clients-service.js';
import {NodeWaitlist} from '../../../../lists/waitlist/node-waitlist.js';
import {NodeLists} from '../../../../lists/node-lists';

const axios = require('axios');

class NodeDiscoveryService {

    constructor(){

        console.log("NodeDiscover constructor");

    }

    startDiscovery(){

        this.discoverFallbackNodes();

    }

    async discoverFallbackNodes(){

        await this.downloadFallBackList("http://webdollar.io/public/webdollars.json");
        await this.downloadFallBackList("http://skyhub.me/public/webdollars.json");
        await this.downloadFallBackList("http://visionbot.net/webdollars.json");
        await this.downloadFallBackList("http://budisteanu.net/webdollars.json");

        if ((NodeLists.nodes !== null)&&(NodeLists.nodes.length < 5)){
            let that = this;
            setTimeout(function(){return that.discoverFallbackNodes()}, nodeFallBackInterval)
        }
    }

    async downloadFallBackList(address){

        try{
            let response = await axios.create({
                baseURL: address,
                timeout: 10000,
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            let data = response.data;

            if (typeof data === 'string') data = JSON.parse(data);

            //console.log(data, typeof data);

            if ((typeof data === 'object') && (data !== null)){

                let nodes =  [];
                let name = '';

                //console.log(data);
                //console.log((data.hasOwnProperty('protocol')));
                //console.log(((data['protocol'] === nodeProtocol)));

                if ((data.hasOwnProperty('protocol'))&&(data['protocol'] === nodeProtocol)){
                    name = data.name||'';
                    nodes = data.nodes||[];

                    //console.log("FallBack Nodes ",nodes);

                    if ((nodes !== null)&&(Array.isArray(nodes))){

                        //console.log("NEW NODES", nodes);

                        for (let i=0; i<nodes.length; i++) {

                            let nodeAddress = nodes[i].addr||'';
                            let nodePort = nodes[i].port||'';

                            NodeWaitlist.addNewNodeToWaitlist(nodeAddress, nodePort);
                        }

                    }
                }

                return nodes;
            }
        }
        catch(Exception){
            console.log("ERROR downloading list: ", address, Exception.toString());
            return null;
        }
    }



}

exports.NodeDiscoveryService = new NodeDiscoveryService();

