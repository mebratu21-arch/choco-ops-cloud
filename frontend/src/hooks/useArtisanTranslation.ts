import { useBatchTranslate, useDetectLanguage } from '../services/aiService';

export const useArtisanTranslation = () => {
    const { mutateAsync: translate, isPending: isTranslating } = useBatchTranslate();
    const { mutateAsync: detect, isPending: isDetecting } = useDetectLanguage();

    return {
        translate,
        detect,
        isLoading: isTranslating || isDetecting
    };
};
