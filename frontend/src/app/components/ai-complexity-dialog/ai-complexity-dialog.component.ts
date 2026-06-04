import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlgorithmStore } from '../../store/algorithm.store';
import { AlgorithmService } from '../../services/algorithm.service';
import { AlgorithmComplexityAnalysis } from '../../models/algorithm.models';

@Component({
    selector: 'app-ai-complexity-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ai-complexity-dialog.component.html',
})
export class AiComplexityDialogComponent {
    algorithmCode = '';
    algorithmLanguage = 'pseudocode';
    algorithmCaseType = 'worst';
    algorithmLoading = false;
    algorithmError: string | null = null;
    algorithmResult: AlgorithmComplexityAnalysis | null = null;

    constructor(
        public store: AlgorithmStore,
        private algorithmService: AlgorithmService
    ) {
        effect(() => {
            if (this.store.aiDialogOpen() && !this.algorithmCode) {
                this.algorithmCode =
                    '//验证两个大整数相等\n' +
                    '输入：整数x1,x2,k;\n' +
                    '重复以下步骤k次;\n' +
                    '选择随机素数p∈[1,M];\n' +
                    'if x1 != x2 mod p then\n' +
                    '   返回 false;\n' +
                    '返回 true ';
            }
        });
    }

    closeAlgorithmDialog(): void {
        this.store.closeAiComplexityDialog();
    }

    analyzeAlgorithmComplexity(): void {
        const code = this.algorithmCode.trim();

        if (!code) {
            this.algorithmError = '请输入伪代码或简单脚本';
            return;
        }

        this.algorithmLoading = true;
        this.algorithmError = null;
        this.algorithmResult = null;

        this.algorithmService.analyzeAlgorithmComplexity({
            code,
            language: this.algorithmLanguage,
            caseType: this.algorithmCaseType,
        }).subscribe({
            next: result => {
                this.algorithmResult = result;
                this.algorithmLoading = false;
            },
            error: err => {
                console.error('AI complexity analyze failed:', err);
                this.algorithmError = err?.error?.message || 'AI 复杂度分析失败，请稍后重试';
                this.algorithmLoading = false;
            },
        });
    }
}