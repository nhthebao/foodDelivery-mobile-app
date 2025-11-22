declare module "expo-constants" {
    export interface Extra {
        AI_KEY?: string;
        EMAIL_USER?: string;
        EMAIL_PASSWORD?: string;
    }

    export interface AppConfig {
        extra?: Extra;
    }

    export interface Manifest2 {
        extra?: Extra;
    }

    export const expoConfig: AppConfig | undefined;
    export const manifest2: Manifest2 | undefined;
}