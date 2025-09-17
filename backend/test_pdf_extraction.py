#!/usr/bin/env python3
"""
PDF表格提取测试脚本
用法: python test_pdf_extraction.py [PDF文件路径]
如果不指定文件路径，默认使用 '../测试文件1.pdf'
"""

import asyncio
import sys
import os
import json
from pathlib import Path

sys.path.append('.')

from app.services.pdf_detect import PDFDetectionService


async def extract_and_save_tables(pdf_path: str):
    """提取PDF表格并保存JSON Schema"""
    
    # 检查文件是否存在
    if not os.path.exists(pdf_path):
        print(f"❌ 文件不存在: {pdf_path}")
        return False
    
    # 获取文件信息
    file_size = os.path.getsize(pdf_path)
    filename = os.path.basename(pdf_path)
    
    print(f"🚀 开始处理PDF文件: {filename}")
    print(f"📁 文件大小: {file_size:,} bytes")
    
    try:
        # 读取PDF文件
        with open(pdf_path, 'rb') as f:
            file_content = f.read()
        
        # 初始化PDF检测服务
        pdf_service = PDFDetectionService()
        
        # 提取表格
        tables = await pdf_service.extract_tables_from_pdf(
            file_content=file_content,
            file_name=filename,
            doc_id=f'test-{filename}'
        )
        
        if not tables:
            print("⚠️ 未检测到任何表格")
            return False
        
        # 生成输出文件名
        base_name = Path(filename).stem
        schema_file = f"{base_name}_schema.json"
        summary_file = f"{base_name}_summary.json"
        
        # 保存完整JSON Schema
        output_data = {
            'file_info': {
                'filename': filename,
                'file_size': file_size,
                'total_tables': len(tables),
                'total_pages': max((t['page'] for t in tables), default=1)
            },
            'extraction_results': {
                'success': True,
                'processing_time': tables[0]['meta'].get('processing_time_ms', 0) if tables else 0,
                'detectors_used': list(set(t['meta']['detector'] for t in tables))
            },
            'tables': tables
        }
        
        with open(schema_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        # 创建简化摘要
        simplified_tables = []
        for i, table in enumerate(tables):
            # 获取非空单元格的样本文本
            sample_texts = []
            for cell in table['cells'][:10]:  # 取前10个单元格
                text = cell['text'].strip()
                if text and len(text) > 2:  # 过滤空白和过短文本
                    sample_texts.append(text[:50])  # 限制长度
                if len(sample_texts) >= 3:  # 最多3个样本
                    break
            
            simplified = {
                'table_index': i + 1,
                'page': table['page'],
                'table_id': table['table_id'],
                'dimensions': f"{table['n_rows']}行 × {table['n_cols']}列",
                'detector': table['meta']['detector'],
                'confidence': round(table['meta']['confidence'], 3),
                'total_cells': len(table['cells']),
                'non_empty_cells': len([c for c in table['cells'] if c['text'].strip()]),
                'sample_text': sample_texts,
                'table_area_ratio': round(table['meta'].get('table_area_ratio', 0), 3)
            }
            simplified_tables.append(simplified)
        
        summary_data = {
            'file_info': output_data['file_info'],
            'extraction_results': output_data['extraction_results'],
            'table_summary': simplified_tables,
            'statistics': {
                'avg_confidence': round(sum(t['meta']['confidence'] for t in tables) / len(tables), 3),
                'total_cells': sum(len(t['cells']) for t in tables),
                'pages_with_tables': len(set(t['page'] for t in tables)),
                'detectors_breakdown': {
                    detector: len([t for t in tables if t['meta']['detector'] == detector])
                    for detector in set(t['meta']['detector'] for t in tables)
                }
            }
        }
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        # 输出结果
        print(f"\n🎉 提取成功!")
        print(f"📊 统计信息:")
        print(f"   - 总表格数: {len(tables)}")
        print(f"   - 处理页数: {summary_data['statistics']['pages_with_tables']}")
        print(f"   - 总单元格: {summary_data['statistics']['total_cells']:,}")
        print(f"   - 平均置信度: {summary_data['statistics']['avg_confidence']}")
        print(f"   - 检测器使用: {', '.join(summary_data['statistics']['detectors_breakdown'].keys())}")
        
        print(f"\n📁 生成文件:")
        print(f"   - {schema_file} ({os.path.getsize(schema_file):,} bytes) - 完整JSON Schema")
        print(f"   - {summary_file} ({os.path.getsize(summary_file):,} bytes) - 摘要信息")
        
        # 显示每个表格的简要信息
        print(f"\n📋 表格详情:")
        for table_info in simplified_tables:
            print(f"   表格 {table_info['table_index']}: "
                  f"第{table_info['page']}页, "
                  f"{table_info['dimensions']}, "
                  f"置信度{table_info['confidence']}, "
                  f"检测器: {table_info['detector']}")
        
        return True
        
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主函数"""
    # 获取PDF文件路径
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        pdf_path = '../测试文件1.pdf'
    
    print(f"🔍 PDF表格提取测试工具")
    print(f"📄 目标文件: {pdf_path}")
    print("=" * 50)
    
    # 运行提取任务
    success = asyncio.run(extract_and_save_tables(pdf_path))
    
    if success:
        print("\n✅ 测试完成!")
    else:
        print("\n❌ 测试失败!")
        sys.exit(1)


if __name__ == "__main__":
    main() 