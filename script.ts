import { MendixSdkClient, Project } from 'mendixplatformsdk';
import { createObjectCsvWriter } from 'csv-writer';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import { domainmodels } from 'mendixmodelsdk';

// Project & auth config
const username = '';
const apikey = '';
const projectId = "";
const projectName = ""

const client = new MendixSdkClient(username, apikey);

const createCsvWriter  = createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'domainmodels.csv',
    header: [
        {id: 'entity', title: 'Entity'},
        {id: 'generalization', title: 'Generalization'},
        {id: 'attribute', title: 'Attribute'},
        {id: 'type', title: 'Type'},
    ]
});
const records: ObjectMap<any>[] = [];

async function main() {
    
    const project = new Project(client, projectId, projectName);
    const workingCopy = await client.platform().createOnlineWorkingCopy(project);

    const model = workingCopy.model();

    model.allDomainModels().forEach(domainModel => {
        domainModel.entities.forEach(entity => {
            let generalizationName: string;
            if (entity.generalization instanceof domainmodels.Generalization){
                const generalization = <domainmodels.Generalization> entity.generalization;
                generalizationName = generalization.generalizationQualifiedName;
            }
            entity.attributes.forEach(attribute => {
                records.push({
                    entity: entity.qualifiedName,
                    generalization: generalizationName,
                    attribute: attribute.name,
                    type: attribute.type.structureTypeName
                })
            })
        });
    });
    csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done');
    });
}

main();