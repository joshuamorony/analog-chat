import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import {
	ɵSERVER_CONTEXT as SERVER_CONTEXT,
	provideServerRendering,
} from '@angular/platform-server';

import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
	providers: [
		provideServerRendering(),
		{ provide: SERVER_CONTEXT, useValue: 'ssr-analog' },
	],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
