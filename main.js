'use strict';


const utils = require('@iobroker/adapter-core');


var snmp = require ("net-snmp");



let adapter;




function startAdapter(options) {
   
    return adapter = utils.adapter(Object.assign({}, options, {
        name: 'webersystems',
		
        ready: dataPolling, 
		
        unload: (callback) => {
            try {
                clearInterval(timer);

                callback();
            } catch (e) {
                callback();
            }
        },

         stateChange: (id, state) => {
            if (state) {
                // The state was changed
                // adapter.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
				

				
				
				
				
				var changeoid = id;				
				changeoid = changeoid.replace(/webersystems\.\d\./, ''); 
				changeoid = changeoid.replace(/(.*)\./, '');
				changeoid = changeoid.replace(/_/g, '.');
				
				adapter.log.info(changeoid + " " + state.val);
							
								

				var regex = /1.3.6.1.2.1.2.2.1.7.[0-9]+/g;
				
				
				if (changeoid.match(regex)) {
					state.val = Number(state.val);
					var varbindss = [
						{
						oid: changeoid,
						type: snmp.ObjectType.Integer32,
						value: state.val
						}];
					adapter.log.info("change to Interger");
				} else {
					var varbindss = [
						{
						oid: changeoid,
						type: snmp.ObjectType.OctetString,
						value: state.val
						}];
					adapter.log.info("change to String");
				}
		
				var session = snmp.createSession (adapter.config.ipadresse, adapter.config.snmpcommunity);
				session.set (varbindss, function (error, varbindss) {
					if (error) {
						adapter.log.info("setfunktion" + error);
					} else {
						}
				});		
				
            } else {
               
                adapter.log.info(`state ${id} deleted`);
            }
        },


    }));
}

async function systemoids() {

	
}






async function interfaces_ifindex() {
		var oid = "1.3.6.1.2.1.2.2.1.1";
		var session = snmp.createSession (adapter.config.ipadresse, adapter.config.snmpcommunity);
		
		function doneCb (error) {
			if (error)
				 adapter.log.info ("done Cb" + error.toString ());
		}
		function feedCb (varbinds) {
			for (var i = 0; i < varbinds.length; i++) {
				if (snmp.isVarbindError (varbinds[i]))
					 adapter.log.info ('error walk');
				else
					// adapter.log.info (varbinds[i].oid + "|" + varbinds[i].value);
					var oids = varbinds[i].oid;
					oids = oids.replace(/\./g, '_');
					oids = "interface." + varbinds[i].value + "." + oids;
					adapter.setObjectNotExistsAsync(oids, {type: 'state', common: {name: 'ifIndex', type: 'string', role: 'value', read: true, write: false}, native: {}, });								 
					adapter.setState(oids, varbinds[i].value.toString(), true);
					
								
								
								
								
					
			}
		}
		var maxRepetitions = 20;


oid = "1.3.6.1.2.1.2.2.1.1";
session.subtree (oid, maxRepetitions, feedCb, doneCb);		
		
}

async function poeoids() {


		

}

async function dataPolling() {
		var timer = 30000;
		
		setInterval(interfaces_ifindex, timer);
		
		
	}


if (module.parent) {

    module.exports = startAdapter;
} else {
   
    startAdapter();
}