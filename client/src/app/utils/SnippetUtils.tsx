class SnippetUtils {

    public static getAuthHeader(accessToken: string): Headers {
        return (accessToken) ? new Headers({ 'Authorization': `Bearer ${accessToken}` }) : new Headers();
    }

    public static sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static addThousandsSeparators(basicNumber: number): string {
        return basicNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    public static replaceMultipleLineBreak(str: string): string {
        return str.replace(/\n\s*\n/g, "\n");
    }

    public static reduceCommentSize(comment: string, commentMaxLength: number, maxLineSpaceNumber: number): { isCommentValid: boolean, comment: string } {
        comment = SnippetUtils.replaceMultipleLineBreak(comment);
        const lineSpaceLength: number = (comment.match(/\n\r?/g) || []).length;
        const dots: string = " ...";
        let parsedComment: string;
        let isCommentValid: boolean = true;

        if (lineSpaceLength > maxLineSpaceNumber) {
            isCommentValid = false;
            const originalLines: Array<string> = comment.split(/\n\r?/g);
            const slicedLines: Array<string> = originalLines.slice(0, maxLineSpaceNumber);
            parsedComment = slicedLines.join('\n\r');
        } else {
            parsedComment = comment;
        }

        parsedComment = parsedComment.trim();
        if (parsedComment.length < commentMaxLength) {
            if (!isCommentValid) {
                parsedComment += dots;
            }
            return { isCommentValid: isCommentValid, comment: parsedComment };
        }

        isCommentValid = false;
        const numberOfRemovedChars: number = (parsedComment.length - commentMaxLength);
        parsedComment = parsedComment.slice(0, -Math.abs(numberOfRemovedChars + dots.length)).trim();
        parsedComment += dots;
        return { isCommentValid: isCommentValid, comment: parsedComment };
    }
}

export default SnippetUtils;
