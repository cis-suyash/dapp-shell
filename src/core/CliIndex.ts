import * as express from 'express';
import { Environment } from './helpers/Environment';
import * as path from 'path';

export class CliIndex {

    public static getRoute(): string {
        return process.env.CLI_ROUTE;
    }

    public setup(app: express.Application): void {
        if (Environment.isTruthy(process.env.CLI_ENABLED)) {

            app.get(CliIndex.getRoute(), (req, res) => {
                res.sendFile(path.join(__dirname + '../../../public/cli/index.html'));
            });
        }
    }
}
